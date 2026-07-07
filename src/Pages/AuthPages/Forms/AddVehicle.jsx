import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    Car,
    Loader2,
    Upload,
    Tag,
    Wrench,
    ImageIcon,
} from 'lucide-react'
import { $api } from '../../../api/client'
import { formatCurrency } from '../../../utils/currency'

const BODY_TYPES = ['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback', 'pickup', 'mpv']
const ENGINE_TYPES = ['gasoline', 'diesel', 'hybrid', 'electric']
const TRANSMISSIONS = ['automatic', 'manual', 'cvt']

const INITIAL_FORM = {
    brand: '',
    model: '',
    body_type: '',
    engine_type: '',
    transmission: '',
    chassis_number: '',
    plate_number: '',
    status: 'for_sale',
}

const inputClass =
    'w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50'

const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2'

const AddVehicle = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [form, setForm] = useState(INITIAL_FORM)
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [serviceIds, setServiceIds] = useState([])
    const [errors, setErrors] = useState({})

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => $api('/services'),
    })

    const mutation = useMutation({
        mutationFn: async (payload) => {
            const body = new FormData()
            Object.entries(payload.form).forEach(([key, value]) => {
                if (value !== '' && value != null) body.append(key, value)
            })
            if (payload.form.status === 'for_repair') {
                payload.serviceIds.forEach((id) => body.append('service_ids[]', String(id)))
            }
            if (payload.image) body.append('image', payload.image)

            return $api('/vehicles', { method: 'POST', body })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] })
            navigate('/vehicles')
        },
        onError: (error) => {
            if (error.status === 422) {
                setErrors(error._data?.errors ?? {})
            } else {
                setErrors({
                    general: [error._data?.message || 'Failed to register vehicle. Please try again.'],
                })
            }
        },
    })

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => {
            const next = { ...prev }
            delete next[field]
            delete next.general
            return next
        })
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImage(file)
        setImagePreview(URL.createObjectURL(file))
        setErrors((prev) => {
            const next = { ...prev }
            delete next.image
            return next
        })
    }

    const toggleService = (id) => {
        setServiceIds((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        )
    }

    const fieldError = (field) => {
        const err = errors[field]
        if (!err) return null
        return Array.isArray(err) ? err[0] : err
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setErrors({})
        mutation.mutate({ form, serviceIds, image })
    }

    const isForRepair = form.status === 'for_repair'

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto pb-8"
        >
            <button
                type="button"
                onClick={() => navigate('/vehicles')}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-5 transition-colors cursor-pointer"
            >
                <ArrowLeft size={16} />
                Back to Vehicles
            </button>

            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-800/60">
                    <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                        <Car size={22} />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold text-white">Add Vehicle</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Register a new vehicle for sale or repair intake.
                        </p>
                    </div>
                </div>

                {errors.general && (
                    <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {Array.isArray(errors.general) ? errors.general[0] : errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <section>
                        <h2 className="text-sm font-semibold text-white mb-4">Vehicle Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Brand</label>
                                <input
                                    type="text"
                                    value={form.brand}
                                    onChange={(e) => updateField('brand', e.target.value)}
                                    placeholder="e.g. Toyota"
                                    className={inputClass}
                                    required
                                />
                                {fieldError('brand') && (
                                    <p className="text-xs text-red-400 mt-1">{fieldError('brand')}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Model</label>
                                <input
                                    type="text"
                                    value={form.model}
                                    onChange={(e) => updateField('model', e.target.value)}
                                    placeholder="e.g. Hilux"
                                    className={inputClass}
                                    required
                                />
                                {fieldError('model') && (
                                    <p className="text-xs text-red-400 mt-1">{fieldError('model')}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Body Type</label>
                                <select
                                    value={form.body_type}
                                    onChange={(e) => updateField('body_type', e.target.value)}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select body type</option>
                                    {BODY_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {fieldError('body_type') && (
                                    <p className="text-xs text-red-400 mt-1">{fieldError('body_type')}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Engine Type</label>
                                <select
                                    value={form.engine_type}
                                    onChange={(e) => updateField('engine_type', e.target.value)}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select engine</option>
                                    {ENGINE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {fieldError('engine_type') && (
                                    <p className="text-xs text-red-400 mt-1">{fieldError('engine_type')}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Transmission</label>
                                <select
                                    value={form.transmission}
                                    onChange={(e) => updateField('transmission', e.target.value)}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select transmission</option>
                                    {TRANSMISSIONS.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {fieldError('transmission') && (
                                    <p className="text-xs text-red-400 mt-1">{fieldError('transmission')}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold text-white mb-4">Registration</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Plate Number</label>
                                <input
                                    type="text"
                                    value={form.plate_number}
                                    onChange={(e) => updateField('plate_number', e.target.value.toUpperCase())}
                                    placeholder="e.g. ABC1234"
                                    className={`${inputClass} font-mono uppercase`}
                                    required
                                />
                                <p className="text-[10px] text-slate-600 mt-1">Saved as PLATE-{form.plate_number || '...'}</p>
                                {fieldError('plate_number') && (
                                    <p className="text-xs text-red-400 mt-1">{fieldError('plate_number')}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Chassis Number</label>
                                <input
                                    type="text"
                                    value={form.chassis_number}
                                    onChange={(e) => updateField('chassis_number', e.target.value.toUpperCase())}
                                    placeholder="e.g. JT123456789"
                                    className={`${inputClass} font-mono uppercase`}
                                    required
                                />
                                <p className="text-[10px] text-slate-600 mt-1">Saved as CHASSIS-{form.chassis_number || '...'}</p>
                                {fieldError('chassis_number') && (
                                    <p className="text-xs text-red-400 mt-1">{fieldError('chassis_number')}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold text-white mb-4">Listing Status</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => updateField('status', 'for_sale')}
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${form.status === 'for_sale'
                                        ? 'border-emerald-500/40 bg-emerald-500/10'
                                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                                    }`}
                            >
                                <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${form.status === 'for_sale'
                                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                                        : 'border-slate-800 text-slate-500'
                                    }`}>
                                    <Tag size={16} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-white">For Sale</p>
                                    <p className="text-xs text-slate-500 mt-0.5">List in the sales fleet</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => updateField('status', 'for_repair')}
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${form.status === 'for_repair'
                                        ? 'border-amber-500/40 bg-amber-500/10'
                                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                                    }`}
                            >
                                <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${form.status === 'for_repair'
                                        ? 'border-amber-500/30 bg-amber-500/15 text-amber-400'
                                        : 'border-slate-800 text-slate-500'
                                    }`}>
                                    <Wrench size={16} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-white">For Repair</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Creates a repair job + estimate</p>
                                </div>
                            </button>
                        </div>
                        {fieldError('status') && (
                            <p className="text-xs text-red-400 mt-2">{fieldError('status')}</p>
                        )}
                    </section>

                    {isForRepair && (
                        <section>
                            <h2 className="text-sm font-semibold text-white mb-1">Requested Services</h2>
                            <p className="text-xs text-slate-500 mb-4">
                                Select services for the initial repair estimate invoice.
                            </p>
                            <div className="space-y-2 max-h-52 overflow-y-auto border border-slate-800/70 rounded-xl p-3 bg-slate-950/30">
                                {services.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic py-2">No services available.</p>
                                ) : (
                                    services.map((service) => (
                                        <label
                                            key={service.id}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800/30 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={serviceIds.includes(service.id)}
                                                onChange={() => toggleService(service.id)}
                                                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/50"
                                            />
                                            <span className="flex-1 text-sm text-slate-200">{service.name}</span>
                                            <span className="text-xs font-mono text-emerald-400">
                                                {formatCurrency(service.base_price)}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                            {fieldError('service_ids') && (
                                <p className="text-xs text-red-400 mt-2">{fieldError('service_ids')}</p>
                            )}
                        </section>
                    )}

                    <section>
                        <h2 className="text-sm font-semibold text-white mb-4">Vehicle Photo</h2>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <label className="flex-1 w-full cursor-pointer">
                                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/40 px-6 py-8 hover:border-sky-500/30 hover:bg-slate-950/60 transition-colors">
                                    <Upload size={22} className="text-slate-500" />
                                    <span className="text-sm text-slate-400">
                                        {image ? image.name : 'Click to upload image'}
                                    </span>
                                    <span className="text-[10px] text-slate-600">JPEG, PNG, WebP — max 5MB</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            {!imagePreview && (
                                <div className="w-full sm:w-40 h-32 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600 shrink-0">
                                    <ImageIcon size={28} />
                                </div>
                            )}
                        </div>
                        {fieldError('image') && (
                            <p className="text-xs text-red-400 mt-2">{fieldError('image')}</p>
                        )}
                    </section>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-800/60">
                        <button
                            type="button"
                            onClick={() => navigate('/vehicles')}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                'Register Vehicle'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}

export default AddVehicle
