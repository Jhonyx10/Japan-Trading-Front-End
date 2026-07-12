import { useState, useMemo, useRef, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GuestLayout from '../../Layouts/GuestLayout'
import { $api } from '../../api/client' // adjust path to wherever $api lives

const BODY_TYPES = ['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback', 'pickup', 'mpv']
const ENGINE_TYPES = ['gasoline', 'diesel', 'hybrid', 'electric']
const TRANSMISSIONS = ['automatic', 'manual', 'cvt']

const STEP_LABELS = ['Your info & vehicle', 'Choose services', 'Review & confirm']

const STORAGE_KEY = 'booking-progress'
const BACK_HOME_DELAY_SECONDS = 10

const DEFAULT_FORM_VALUES = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    brand: '',
    model: '',
    body_type: '',
    engine_type: '',
    transmission: '',
    chassis_number: '',
    plate_number: '',
}

function loadPersistedState() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch (err) {
        console.error('[booking] failed to read persisted state', err)
        return null
    }
}

function savePersistedState(partial) {
    try {
        const current = loadPersistedState() || {}
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }))
    } catch (err) {
        console.error('[booking] failed to persist state', err)
    }
}

function clearPersistedState() {
    try {
        sessionStorage.removeItem(STORAGE_KEY)
    } catch (err) {
        console.error('[booking] failed to clear persisted state', err)
    }
}

const peso = (n) =>
    `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const FieldLabel = ({ title }) => (
    <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-1">{title}</label>
)

const FieldError = ({ message }) =>
    message ? <p className="text-red-400 text-xs mt-1.5 ml-1">{message}</p> : null

const SectionHeader = ({ title }) => (
    <h3 className="text-emerald-400 font-semibold text-[11px] uppercase tracking-[2px] mt-8 mb-3">
        {title}
    </h3>
)

const ChipGroup = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
            <button
                type="button"
                key={opt}
                onClick={() => onChange(opt)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors cursor-pointer ${value === opt
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
            >
                {opt}
            </button>
        ))}
    </div>
)

const StepIndicator = ({ currentStep }) => (
    <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1
            const isActive = stepNum === currentStep
            const isDone = stepNum < currentStep
            return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${isDone
                                ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                                : isActive
                                    ? 'border-emerald-400 text-emerald-400'
                                    : 'border-slate-800 text-slate-600'
                                }`}
                        >
                            {isDone ? '✓' : stepNum}
                        </div>
                        <span
                            className={`hidden sm:inline text-xs font-medium whitespace-nowrap ${isActive ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-600'
                                }`}
                        >
                            {label}
                        </span>
                    </div>
                    {stepNum !== STEP_LABELS.length && (
                        <div className={`h-px flex-1 mx-3 ${isDone ? 'bg-emerald-400/50' : 'bg-slate-800'}`} />
                    )}
                </div>
            )
        })}
    </div>
)

const BookingPage = () => {
    const navigate = useNavigate()

    // Rehydrate once on mount — read persisted state a single time via useMemo.
    const persisted = useMemo(() => loadPersistedState(), [])

    const [step, setStep] = useState(persisted?.step ?? 1)
    const [submitted, setSubmitted] = useState(persisted?.submitted ?? false)
    const [referenceNumber, setReferenceNumber] = useState(persisted?.referenceNumber ?? null)

    // --- Step 1: customer + vehicle details ---
    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
        watch,
    } = useForm({
        defaultValues: persisted?.formValues ?? DEFAULT_FORM_VALUES,
    })

    // imageFile/imagePreview can't survive sessionStorage (not serializable),
    // so these always reset on refresh — that's expected/unavoidable.
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)

    const handleImageSelected = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    // --- Step 2: services (react-query via $api) ---
    const {
        data: services = [],
        isLoading: servicesLoading,
        isError: servicesIsError,
        error: servicesQueryError,
    } = useQuery({
        queryKey: ['public-services'],
        queryFn: () => $api('/public/services'),
        staleTime: 5 * 60 * 1000,
        retry: 1,
        onError: (err) => {
            console.error('[useQuery public-services] error', err)
        },
    })

    const servicesError = servicesIsError
        ? servicesQueryError?.data?.message || servicesQueryError?.message || 'Failed to load services'
        : null

    const [selectedIds, setSelectedIds] = useState(persisted?.selectedIds ?? [])
    const [selectedItems, setSelectedItems] = useState(persisted?.selectedItems ?? {})

    const toggleService = (id) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                setSelectedItems((prevItems) => {
                    const next = { ...prevItems }
                    delete next[id]
                    return next
                })
                return prev.filter((i) => i !== id)
            }
            return [...prev, id]
        })
    }

    const toggleItem = (serviceId, itemId) => {
        setSelectedItems((prev) => {
            const current = prev[serviceId] || []
            const next = current.includes(itemId)
                ? current.filter((i) => i !== itemId)
                : [...current, itemId]
            return { ...prev, [serviceId]: next }
        })
    }

    // --- Step 3: review ---
    const selectedServices = useMemo(
        () => services.filter((s) => selectedIds.includes(s.id)),
        [services, selectedIds]
    )

    const totalEstimatedAmount = useMemo(() => {
        let total = 0
        selectedServices.forEach((service) => {
            total += parseFloat(service.base_price || '0')
            const itemIds = selectedItems[service.id] || []
            service.item_category?.inventories?.forEach((inv) => {
                if (itemIds.includes(inv.id)) total += parseFloat(inv.unit_price || '0')
            })
        })
        return total
    }, [selectedServices, selectedItems])

    // --- Registration mutation (react-query via $api) ---
    const {
        mutate: registerBooking,
        isPending: submitting,
        error: submitMutationError,
    } = useMutation({
        mutationFn: (formData) =>
            $api('/public/booking', {
                method: 'POST',
                body: formData,
            }),
        onSuccess: (data) => {
            setReferenceNumber(data.reference_number)
            setSubmitted(true)
            // Once submitted, we don't need the in-progress form/selection data
            // anymore — keep only what the confirmation screen needs.
            savePersistedState({
                submitted: true,
                referenceNumber: data.reference_number,
                step: undefined,
                formValues: undefined,
                selectedIds: undefined,
                selectedItems: undefined,
            })
        },
        onError: (err) => {
            console.error('[useMutation submitRepairRegistration] error', err)
        },
    })

    const submitError = submitMutationError
        ? submitMutationError?.data?.message ||
        submitMutationError?.message ||
        'Something went wrong while submitting. Please try again.'
        : null

    const goToServices = () => {
        setStep(2)
    }
    const goToReview = () => {
        setStep(3)
    }
    const goBack = () => setStep((s) => Math.max(1, s - 1))

    // Persist progress (step, form values, selections) any time they change,
    // but only while the booking hasn't been submitted yet.
    useEffect(() => {
        if (submitted) return

        const subscription = watch((values) => {
            savePersistedState({
                step,
                selectedIds,
                selectedItems,
                formValues: values,
            })
        })

        // Also save immediately on mount / step or selection change,
        // since watch() only fires on further field changes.
        savePersistedState({
            step,
            selectedIds,
            selectedItems,
            formValues: getValues(),
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, selectedIds, selectedItems, submitted])

    const handleRegister = () => {
        const values = getValues()
        const fd = new FormData()
        Object.entries(values).forEach(([key, val]) => fd.append(key, val ?? ''))

        selectedIds.forEach((id) => {
            fd.append('service_ids[]', id)
        })

        Object.entries(selectedItems).forEach(([serviceId, itemIds]) => {
            itemIds.forEach((itemId) => {
                fd.append(`service_items[${serviceId}][]`, itemId)
            })
        })
        fd.append('status', 'for_repair')
        if (imageFile) fd.append('image', imageFile)

        registerBooking(fd)
    }

    // --- 10 second "back to home" delay on the confirmation screen ---
    const [secondsRemaining, setSecondsRemaining] = useState(BACK_HOME_DELAY_SECONDS)

    useEffect(() => {
        if (!submitted) return

        setSecondsRemaining(BACK_HOME_DELAY_SECONDS)

        const interval = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [submitted])

    const handleBackToHome = () => {
        clearPersistedState()
        navigate('/')
    }

    if (submitted) {
        return (
            <>
                <GuestLayout />
                <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
                    <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none -z-10" />
                    <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[140px] pointer-events-none -z-10" />

                    <div className="flex flex-col items-center justify-center px-6 text-center relative z-10 min-h-screen">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mb-6">
                            ✓
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Booking submitted</h1>
                        <p className="text-slate-400 max-w-sm mb-8">
                            We've received your repair request. Our team will reach out shortly to confirm details.
                        </p>

                        <div className="w-full max-w-sm bg-slate-900/60 border border-dashed border-emerald-500/40 rounded-3xl p-6 mb-8">
                            <p className="text-slate-500 uppercase tracking-[2px] text-[11px] font-semibold mb-3">
                                Your reference number
                            </p>
                            <p className="text-emerald-400 text-3xl sm:text-4xl font-bold tracking-widest break-all mb-4">
                                {referenceNumber}
                            </p>
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(referenceNumber)}
                                className="text-xs font-medium text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 rounded-lg px-3 py-2 transition-colors cursor-pointer"
                            >
                                Copy to clipboard
                            </button>
                            <p className="text-slate-500 text-xs mt-4">
                                Please save this — you'll need it to track or follow up on your booking.
                            </p>
                        </div>

                        <button
                            onClick={handleBackToHome}
                            disabled={secondsRemaining > 0}
                            className={`font-bold px-6 py-3 rounded-xl transition-colors ${
                                secondsRemaining > 0
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer'
                            }`}
                        >
                            {secondsRemaining > 0 ? `Back to home (${secondsRemaining}s)` : 'Back to home'}
                        </button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <GuestLayout />
            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
                <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none -z-10" />
                <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[140px] pointer-events-none -z-10" />

                <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 relative z-10 w-full">
                    <motion.h1 className="text-3xl font-bold text-white mb-1 tracking-tight mb-10">Booking</motion.h1>
                    <motion.h1>
                        <p className="text-emerald-400 text-[11px] font-semibold tracking-[2px] uppercase mb-2">
                            Step {step} of 3
                        </p>
                    </motion.h1>
                    <StepIndicator currentStep={step} />

                    <AnimatePresence mode="wait">
                        {/* STEP 1: Customer + vehicle details */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Your info & vehicle</h1>
                                <p className="text-slate-400 mb-6">Tell us who you are and about the vehicle that needs work.</p>

                                <SectionHeader title="Personal information" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel title="First name" />
                                        <Controller
                                            control={control}
                                            name="first_name"
                                            rules={{ required: 'First name is required' }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder="Juan"
                                                    className={`w-full bg-slate-900/60 text-white p-4 rounded-xl border outline-none focus:border-emerald-500/50 ${errors.first_name ? 'border-red-500' : 'border-slate-800'
                                                        }`}
                                                />
                                            )}
                                        />
                                        <FieldError message={errors.first_name?.message} />
                                    </div>
                                    <div>
                                        <FieldLabel title="Last name" />
                                        <Controller
                                            control={control}
                                            name="last_name"
                                            rules={{ required: 'Last name is required' }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder="Dela Cruz"
                                                    className={`w-full bg-slate-900/60 text-white p-4 rounded-xl border outline-none focus:border-emerald-500/50 ${errors.last_name ? 'border-red-500' : 'border-slate-800'
                                                        }`}
                                                />
                                            )}
                                        />
                                        <FieldError message={errors.last_name?.message} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <FieldLabel title="Phone number (optional)" />
                                        <Controller
                                            control={control}
                                            name="phone_number"
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder="09XXXXXXXXX"
                                                    className={`w-full bg-slate-900/60 text-white p-4 rounded-xl border outline-none focus:border-emerald-500/50 ${errors.phone_number ? 'border-red-500' : 'border-slate-800'
                                                        }`}
                                                />
                                            )}
                                        />
                                        <FieldError message={errors.phone_number?.message} />
                                    </div>
                                    <div>
                                        <FieldLabel title="Email (optional)" />
                                        <Controller
                                            control={control}
                                            name="email"
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder="juan@email.com"
                                                    className={`w-full bg-slate-900/60 text-white p-4 rounded-xl border outline-none focus:border-emerald-500/50 ${errors.email ? 'border-red-500' : 'border-slate-800'
                                                        }`}
                                                />
                                            )}
                                        />
                                        <FieldError message={errors.email?.message} />
                                    </div>
                                </div>

                                {/* Image upload */}
                                <SectionHeader title="Vehicle photo (optional)" />
                                <div className="mb-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelected}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-40 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-colors"
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Vehicle preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-500 text-sm">📷 Tap to add a vehicle photo</span>
                                        )}
                                    </button>
                                </div>

                                <SectionHeader title="Identification" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel title="Brand" />
                                        <Controller
                                            control={control}
                                            name="brand"
                                            rules={{ required: 'Brand is required' }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder="e.g. Toyota"
                                                    className={`w-full bg-slate-900/60 text-white p-4 rounded-xl border outline-none focus:border-emerald-500/50 ${errors.brand ? 'border-red-500' : 'border-slate-800'
                                                        }`}
                                                />
                                            )}
                                        />
                                        <FieldError message={errors.brand?.message} />
                                    </div>
                                    <div>
                                        <FieldLabel title="Model" />
                                        <Controller
                                            control={control}
                                            name="model"
                                            rules={{ required: 'Model is required' }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder="e.g. Camry"
                                                    className={`w-full bg-slate-900/60 text-white p-4 rounded-xl border outline-none focus:border-emerald-500/50 ${errors.model ? 'border-red-500' : 'border-slate-800'
                                                        }`}
                                                />
                                            )}
                                        />
                                        <FieldError message={errors.model?.message} />
                                    </div>
                                </div>

                                <SectionHeader title="Specifications" />
                                <div className="space-y-5">
                                    <div>
                                        <FieldLabel title="Body type" />
                                        <Controller
                                            control={control}
                                            name="body_type"
                                            rules={{ required: 'Body type is required' }}
                                            render={({ field: { onChange, value } }) => (
                                                <ChipGroup options={BODY_TYPES} value={value} onChange={onChange} />
                                            )}
                                        />
                                        <FieldError message={errors.body_type?.message} />
                                    </div>
                                    <div>
                                        <FieldLabel title="Engine type" />
                                        <Controller
                                            control={control}
                                            name="engine_type"
                                            rules={{ required: 'Engine type is required' }}
                                            render={({ field: { onChange, value } }) => (
                                                <ChipGroup options={ENGINE_TYPES} value={value} onChange={onChange} />
                                            )}
                                        />
                                        <FieldError message={errors.engine_type?.message} />
                                    </div>
                                    <div>
                                        <FieldLabel title="Transmission" />
                                        <Controller
                                            control={control}
                                            name="transmission"
                                            rules={{ required: 'Transmission is required' }}
                                            render={({ field: { onChange, value } }) => (
                                                <ChipGroup options={TRANSMISSIONS} value={value} onChange={onChange} />
                                            )}
                                        />
                                        <FieldError message={errors.transmission?.message} />
                                    </div>
                                </div>

                                <SectionHeader title="Registration" />
                                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                                    <div>
                                        <FieldLabel title="Chassis number" />
                                        <Controller
                                            control={control}
                                            name="chassis_number"
                                            rules={{ required: 'Chassis number is required' }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder="CHASSIS-000000"
                                                    className={`w-full bg-transparent text-white border-b pb-3 outline-none ${errors.chassis_number ? 'border-red-500' : 'border-slate-700'
                                                        }`}
                                                />
                                            )}
                                        />
                                        <FieldError message={errors.chassis_number?.message} />
                                    </div>
                                    <div>
                                        <FieldLabel title="Plate number" />
                                        <Controller
                                            control={control}
                                            name="plate_number"
                                            rules={{ required: 'Plate number is required' }}
                                            render={({ field }) => (
                                                <input {...field} placeholder="PLATE-000000" className="w-full bg-transparent text-white outline-none" />
                                            )}
                                        />
                                        <FieldError message={errors.plate_number?.message} />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit(goToServices)}
                                    className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-bold p-5 rounded-2xl mt-10 transition-colors cursor-pointer"
                                >
                                    Continue to services
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: Choose services */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Choose services</h1>
                                <p className="text-slate-400 mb-6">Select everything this repair needs.</p>

                                {servicesLoading && (
                                    <div className="py-16 text-center text-slate-500 text-sm">Loading services…</div>
                                )}

                                {servicesError && (
                                    <div className="py-16 text-center">
                                        <p className="text-white font-medium mb-1">Couldn't load services</p>
                                        <p className="text-slate-500 text-sm">Check your connection and try again.</p>
                                    </div>
                                )}

                                {!servicesLoading && !servicesError && (
                                    <div className="space-y-3">
                                        {services.map((service) => {
                                            const isSelected = selectedIds.includes(service.id)
                                            const inventories = service.item_category?.inventories || []
                                            const hasItems = inventories.length > 0
                                            const serviceSelectedItems = selectedItems[service.id] || []

                                            return (
                                                <div
                                                    key={service.id}
                                                    onClick={() => toggleService(service.id)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-emerald-500/10 border-emerald-400'
                                                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex-1 pr-3">
                                                            <p className="text-white text-base font-semibold">{service.name}</p>
                                                            <p className="text-slate-500 text-xs mt-0.5">
                                                                {service.required_worker_type?.name?.replace('_', ' ')}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center border ${isSelected ? 'bg-emerald-400 border-emerald-400' : 'border-slate-700'
                                                                }`}
                                                        >
                                                            {isSelected && <span className="text-slate-950 text-xs font-bold">✓</span>}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 font-medium mt-2">{peso(service.base_price)}</p>

                                                    {isSelected && hasItems && (
                                                        <div
                                                            className="mt-4 pt-4 border-t border-slate-800"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold mb-3">
                                                                Select {service.item_category?.name}
                                                            </p>
                                                            {inventories.map((inv) => {
                                                                const isItemSelected = serviceSelectedItems.includes(inv.id)
                                                                return (
                                                                    <div
                                                                        key={inv.id}
                                                                        onClick={() => toggleItem(service.id, inv.id)}
                                                                        className={`flex justify-between items-center py-2.5 px-3 mb-2 rounded-xl border cursor-pointer ${isItemSelected
                                                                            ? 'bg-white/10 border-white/20'
                                                                            : 'bg-black/20 border-slate-800'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center flex-1">
                                                                            <div
                                                                                className={`w-4 h-4 rounded mr-3 border flex items-center justify-center ${isItemSelected
                                                                                    ? 'bg-emerald-400 border-emerald-400'
                                                                                    : 'border-slate-700'
                                                                                    }`}
                                                                            >
                                                                                {isItemSelected && (
                                                                                    <span className="text-slate-950 text-[10px] font-bold">✓</span>
                                                                                )}
                                                                            </div>
                                                                            <span className={`text-sm ${isItemSelected ? 'text-white' : 'text-slate-400'}`}>
                                                                                {inv.item_name}
                                                                            </span>
                                                                        </div>
                                                                        <span
                                                                            className={`text-xs font-medium ${isItemSelected ? 'text-emerald-300' : 'text-slate-500'
                                                                                }`}
                                                                        >
                                                                            +{peso(inv.unit_price)}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-10">
                                    <button
                                        onClick={goBack}
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold p-5 rounded-2xl transition-colors cursor-pointer"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={goToReview}
                                        disabled={selectedIds.length === 0}
                                        className={`flex-[2] font-bold p-5 rounded-2xl transition-colors ${selectedIds.length > 0
                                            ? 'bg-emerald-400 hover:bg-emerald-500 text-slate-950 cursor-pointer'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Continue ({selectedIds.length} selected)
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Review & confirm */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">Review and confirm</h1>

                                <div className="bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden mb-5">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Vehicle" className="w-full h-52 object-cover" />
                                    ) : (
                                        <div className="w-full h-40 bg-slate-900 flex items-center justify-center">
                                            <span className="text-slate-600 text-sm">No image available</span>
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <p className="text-emerald-400 font-semibold text-[11px] tracking-[2px] uppercase mb-1">
                                            Contact
                                        </p>
                                        <p className="text-white text-lg font-semibold mb-1">
                                            {getValues('first_name')} {getValues('last_name')}
                                        </p>
                                        <p className="text-slate-400 text-sm mb-1">{getValues('phone_number')}</p>
                                        {getValues('email') && (
                                            <p className="text-slate-400 text-sm mb-4">{getValues('email')}</p>
                                        )}

                                        <p className="text-emerald-400 font-semibold text-[11px] tracking-[2px] uppercase mb-1 mt-4">
                                            Vehicle info
                                        </p>
                                        <p className="text-white text-2xl font-bold mb-3 tracking-tight">
                                            {getValues('brand')} {getValues('model')}
                                        </p>
                                        <div className="bg-black border border-dashed border-slate-700 py-1.5 px-3 rounded-lg inline-block mb-6">
                                            <span className="text-emerald-400 text-xs font-semibold tracking-widest">
                                                {getValues('plate_number')}
                                            </span>
                                        </div>

                                        <p className="text-slate-500 font-semibold text-[11px] tracking-[2px] uppercase mb-2">
                                            Availed services
                                        </p>
                                        {selectedServices.map((service) => {
                                            const itemIds = selectedItems[service.id] || []
                                            const inventories = service.item_category?.inventories || []
                                            return (
                                                <div key={service.id} className="py-3 border-b border-slate-800">
                                                    <div className="flex justify-between">
                                                        <span className="text-white text-[15px]">{service.name}</span>
                                                        <span className="text-slate-300 font-medium">{peso(service.base_price)}</span>
                                                    </div>
                                                    {itemIds.length > 0 && (
                                                        <div className="mt-2 pl-2 space-y-1.5">
                                                            {inventories
                                                                .filter((inv) => itemIds.includes(inv.id))
                                                                .map((inv) => (
                                                                    <div key={inv.id} className="flex justify-between">
                                                                        <span className="text-slate-400 text-[13px]">• {inv.item_name}</span>
                                                                        <span className="text-emerald-300/80 text-[13px] font-medium">
                                                                            +{peso(inv.unit_price)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col items-center mb-6">
                                    <span className="text-slate-500 uppercase tracking-[2px] text-[11px] mb-1.5">
                                        Initial estimated amount
                                    </span>
                                    <span className="text-emerald-400 text-4xl font-bold">{peso(totalEstimatedAmount)}</span>
                                </div>

                                {submitError && (
                                    <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                        {submitError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={goBack}
                                        disabled={submitting}
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold p-5 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleRegister}
                                        disabled={submitting}
                                        className={`flex-[2] font-bold p-5 rounded-2xl transition-colors ${submitting ? 'bg-slate-800 text-slate-500' : 'bg-emerald-400 hover:bg-emerald-500 text-slate-950 cursor-pointer'
                                            }`}
                                    >
                                        {submitting ? 'Registering…' : 'Confirm and register'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    )
}

export default BookingPage