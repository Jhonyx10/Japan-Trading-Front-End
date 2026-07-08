import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    ArrowLeft,
    Car,
    Wrench,
    User,
    ClipboardList,
    Loader2,
    AlertCircle,
} from 'lucide-react'
import { $api } from '../../../api/client'
import { formatCurrency } from '../../../utils/currency'

const JOB_STEPS = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
]

const SERVICE_STEPS = [
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Done' },
]

const JOB_STATUS_STYLES = {
    pending: 'border-amber-900/50 bg-amber-900/20 text-amber-400',
    confirmed: 'border-sky-900/50 bg-sky-900/20 text-sky-400',
    assigned: 'border-indigo-900/50 bg-indigo-900/20 text-indigo-400',
    in_progress: 'border-blue-900/50 bg-blue-900/20 text-blue-400',
    completed: 'border-green-900/50 bg-green-900/20 text-green-400',
    cancelled: 'border-red-900/50 bg-red-900/20 text-red-400',
}

const SERVICE_STATUS_STYLES = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    assigned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const formatLabel = (value) =>
    value ? String(value).replace(/_/g, ' ') : '—'

function JobProgressTracker({ status }) {
    if (status === 'cancelled') {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 mt-4">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-400">This repair was cancelled</span>
            </div>
        )
    }

    const currentIndex = JOB_STEPS.findIndex((step) => step.key === status)

    return (
        <div className="mt-5">
            <div className="flex items-center">
                {JOB_STEPS.map((step, index) => {
                    const isDone = currentIndex >= 0 && index <= currentIndex
                    const isActive = index === currentIndex
                    const isLast = index === JOB_STEPS.length - 1

                    return (
                        <div key={step.key} className="flex flex-1 items-center">
                            <span
                                className={`h-3 w-3 shrink-0 rounded-full border-2 transition-colors ${isActive
                                        ? 'border-sky-400 bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]'
                                        : isDone
                                            ? 'border-emerald-400 bg-emerald-400'
                                            : 'border-slate-700 bg-slate-800'
                                    }`}
                            />
                            {!isLast && (
                                <span
                                    className={`mx-1 h-0.5 flex-1 ${index < currentIndex ? 'bg-emerald-400' : 'bg-slate-800'
                                        }`}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="mt-2 flex justify-between gap-1">
                {JOB_STEPS.map((step, index) => (
                    <span
                        key={step.key}
                        className={`text-[10px] font-medium leading-tight ${currentIndex >= 0 && index <= currentIndex
                                ? index === currentIndex
                                    ? 'text-sky-400'
                                    : 'text-emerald-400'
                                : 'text-slate-600'
                            } ${index === 0 ? 'text-left' : index === JOB_STEPS.length - 1 ? 'text-right' : 'text-center'}`}
                        style={{ flex: index === 0 || index === JOB_STEPS.length - 1 ? undefined : 1 }}
                    >
                        {step.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

function ServiceProgressTracker({ status }) {
    if (status === 'cancelled') {
        return (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Service cancelled
            </div>
        )
    }

    const currentIndex = SERVICE_STEPS.findIndex((step) => step.key === status)

    return (
        <div className="mt-3">
            <div className="flex items-center">
                {SERVICE_STEPS.map((step, index) => {
                    const isDone = currentIndex >= 0 && index <= currentIndex
                    const isActive = index === currentIndex
                    const isLast = index === SERVICE_STEPS.length - 1

                    return (
                        <div key={step.key} className="flex flex-1 items-center">
                            <span
                                className={`h-2 w-2 shrink-0 rounded-full ${isActive
                                        ? 'bg-blue-400 ring-2 ring-blue-400/20'
                                        : isDone
                                            ? 'bg-emerald-400'
                                            : 'bg-slate-700'
                                    }`}
                            />
                            {!isLast && (
                                <span
                                    className={`mx-0.5 h-px flex-1 ${index < currentIndex ? 'bg-emerald-400/70' : 'bg-slate-800'
                                        }`}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="mt-1.5 flex justify-between">
                {SERVICE_STEPS.map((step, index) => (
                    <span
                        key={step.key}
                        className={`text-[9px] font-medium ${currentIndex >= 0 && index <= currentIndex
                                ? index === currentIndex
                                    ? 'text-blue-400'
                                    : 'text-emerald-500'
                                : 'text-slate-600'
                            }`}
                    >
                        {step.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

const RepairJobDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const {
        data: job,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['repairJob', id],
        queryFn: () => $api(`/repair-jobs/${id}`),
        enabled: Boolean(id),
    })

    const vehicle = job?.vehicle
    const services = job?.services ?? []
    const invoice = job?.invoice

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-6 max-w-5xl mx-auto"
        >
            <button
                type="button"
                onClick={() => navigate('/repair/assigned')}
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-5 cursor-pointer"
            >
                <ArrowLeft size={16} />
                Back to assigned jobs
            </button>

            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
                    <Loader2 size={28} className="animate-spin text-sky-500" />
                    <span className="text-sm">Loading repair job...</span>
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center gap-4 py-16 px-6 bg-slate-900 border border-slate-800/80 rounded-2xl">
                    <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <AlertCircle size={22} />
                    </span>
                    <div className="text-center">
                        <p className="text-white font-semibold">Could not load this job</p>
                        <p className="text-slate-500 text-sm mt-1">
                            {error?.message || 'Something went wrong. Please try again.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/repair/assigned')}
                        className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={15} />
                        Go back
                    </button>
                </div>
            )}

            {!isLoading && !isError && job && (
                <div className="space-y-6">
                    {/* Header + job tracker */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sky-400 text-[11px] font-semibold uppercase tracking-[2px] mb-1">
                                    Repair ticket
                                </p>
                                <h1 className="text-2xl font-bold text-white">#{job.id}</h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    Created {new Date(job.created_at).toLocaleDateString('en-PH', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${JOB_STATUS_STYLES[job.status] ??
                                    'border-slate-800 bg-slate-900/40 text-slate-400'
                                    }`}
                            >
                                {formatLabel(job.status)}
                            </span>
                        </div>

                        <JobProgressTracker status={job.status} />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-xs">
                            <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                <p className="text-slate-500 mb-1">Estimated cost</p>
                                <p className="font-mono text-slate-200 font-semibold">
                                    {formatCurrency(job.total_estimated_cost)}
                                </p>
                            </div>
                            <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                <p className="text-slate-500 mb-1">Services</p>
                                <p className="text-slate-200 font-semibold">{services.length}</p>
                            </div>
                            <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                <p className="text-slate-500 mb-1">Start date</p>
                                <p className="text-slate-200">
                                    {job.start_date
                                        ? new Date(job.start_date).toLocaleDateString('en-PH')
                                        : '—'}
                                </p>
                            </div>
                            <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                <p className="text-slate-500 mb-1">End date</p>
                                <p className="text-slate-200">
                                    {job.end_date
                                        ? new Date(job.end_date).toLocaleDateString('en-PH')
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-2">
                            <Car size={16} className="text-sky-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Vehicle details</h2>
                        </div>

                        {vehicle?.image_url && (
                            <div className="aspect-[21/9] max-h-52 w-full overflow-hidden bg-slate-950">
                                <img
                                    src={vehicle.image_url}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs mb-1">Vehicle</p>
                                <p className="text-white font-semibold capitalize">
                                    {vehicle?.brand} {vehicle?.model}
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5 capitalize">
                                    {vehicle?.body_type} · {vehicle?.engine_type} · {vehicle?.transmission}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs mb-1">Plate number</p>
                                <p className="font-mono text-slate-200 uppercase tracking-wide">
                                    {vehicle?.plate_number || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs mb-1">Chassis number</p>
                                <p className="font-mono text-slate-200 uppercase">
                                    {vehicle?.chassis_number || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs mb-1">Vehicle status</p>
                                <p className="text-slate-200 capitalize">{formatLabel(vehicle?.status)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Services + per-service progress */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Wrench size={16} className="text-sky-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Services & progress</h2>
                        </div>

                        {services.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
                                <ClipboardList size={22} className="text-slate-700" />
                                <p className="text-sm">No services on this repair job.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {services.map((service) => {
                                    const serviceStatus = service.pivot?.status ?? 'pending'
                                    const workerTypeName =
                                        service.required_worker_type?.name ??
                                        service.required_role?.name ??
                                        null
                                    const assignedWorkers = service.workers ?? []
                                    const repairJobService = job?.repair_job_services?.find(
                                        (rjs) => rjs.id === service.pivot?.id
                                    )
                                    const items = repairJobService?.items ?? []

                                    return (
                                        <div
                                            key={service.id}
                                            className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-4"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 shrink-0">
                                                        <Wrench size={15} />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-200">
                                                            {service.name}
                                                        </p>
                                                        {workerTypeName && (
                                                            <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                                                                Requires {formatLabel(workerTypeName)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full border capitalize ${SERVICE_STATUS_STYLES[serviceStatus] ??
                                                            'bg-slate-800 text-slate-400 border-slate-700'
                                                            }`}
                                                    >
                                                        {formatLabel(serviceStatus)}
                                                    </span>
                                                    <span className="text-sm font-mono font-semibold text-slate-200">
                                                        {formatCurrency(service.pivot?.actual_price ?? service.base_price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <ServiceProgressTracker status={serviceStatus} />

                                            {items.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-slate-800/60">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                                        Selected Items
                                                    </p>
                                                    <div className="space-y-2">
                                                        {items.map((item) => (
                                                            <div key={item.id} className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/50">
                                                                <span className="text-xs font-medium text-slate-300">
                                                                    {item.inventory?.item_name || 'Unknown item'}
                                                                </span>
                                                                <span className="text-xs font-mono font-semibold text-slate-400">
                                                                    {formatCurrency(item.unit_price)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-3 border-t border-slate-800/60">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                                    Assigned workers
                                                </p>
                                                {assignedWorkers.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedWorkers.map((worker) => (
                                                            <span
                                                                key={worker.id}
                                                                className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-900/90 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-800"
                                                            >
                                                                <User size={12} className="text-slate-500" />
                                                                {worker.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-600 italic">No workers assigned yet</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Invoice summary */}
                    {invoice && (
                        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-slate-200 mb-4">Invoice</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                    <p className="text-slate-500 mb-1">Invoice #</p>
                                    <p className="font-mono text-slate-200">{invoice.invoice_number}</p>
                                </div>
                                <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                    <p className="text-slate-500 mb-1">Total</p>
                                    <p className="font-mono text-slate-200 font-semibold">
                                        {formatCurrency(invoice.total_amount)}
                                    </p>
                                </div>
                                <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                    <p className="text-slate-500 mb-1">Amount due</p>
                                    <p className="font-mono text-slate-200">{formatCurrency(invoice.amount_due)}</p>
                                </div>
                                <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                    <p className="text-slate-500 mb-1">Status</p>
                                    <p className="text-slate-200 capitalize">{formatLabel(invoice.status)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    )
}

export default RepairJobDetails
