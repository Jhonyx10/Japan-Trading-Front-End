import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { $api } from '../../../api/client'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Car, CheckCircle2, ClipboardList, Wrench, User, Check, ArrowLeft, UserX, AlertCircle } from 'lucide-react'

const getRequiredWorkerTypeId = (service) => {
    const fromRelation =
        service?.required_worker_type?.id ??
        service?.required_role?.id ??
        null

    if (fromRelation != null) return Number(fromRelation)

    const rawType = service?.worker_type
    if (typeof rawType === 'number') return rawType
    if (typeof rawType === 'string' && rawType !== '' && !Number.isNaN(Number(rawType))) {
        return Number(rawType)
    }
    if (rawType && typeof rawType === 'object' && rawType.id != null) {
        return Number(rawType.id)
    }

    return null
}

const getRequiredWorkerTypeName = (service) =>
    service?.required_worker_type?.name ??
    service?.required_role?.name ??
    (typeof service?.worker_type === 'object' ? service.worker_type?.name : null) ??
    null

const getWorkerTypeId = (worker) => {
    if (worker?.worker_type_id != null) return Number(worker.worker_type_id)

    const nested = worker?.worker_type ?? worker?.workerType
    if (nested && typeof nested === 'object' && nested.id != null) {
        return Number(nested.id)
    }

    return null
}

const getEligibleWorkersForService = (workers, service) => {
    const requiredTypeId = getRequiredWorkerTypeId(service)
    if (requiredTypeId == null) return []

    return workers.filter((worker) => {
        const workerTypeId = getWorkerTypeId(worker)
        return workerTypeId != null && workerTypeId === requiredTypeId
    })
}

const AssignWorker = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const fallbackJobs = location.state?.jobs || []

    const { data: fetchedJobs = [], isLoading: jobsLoading } = useQuery({
        queryKey: ['assigned-jobs'],
        queryFn: () => $api('/repair-jobs/repair'),
    })

    const jobs = fetchedJobs.length > 0 ? fetchedJobs : fallbackJobs

    const { data: workers = [], isLoading: loading } = useQuery({
        queryKey: ['workers'],
        queryFn: () => $api('/workers'),
    })

    const [selectedWorkers, setSelectedWorkers] = useState({})
    const [selectedJob, setSelectedJob] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const filteredJobs = useMemo(() => {
        const confirmedJobs = jobs.filter((job) => job.status === 'confirmed')

        if (!searchTerm.trim()) return confirmedJobs

        const term = searchTerm.toLowerCase()
        return confirmedJobs.filter((job) =>
            job.vehicle?.brand?.toLowerCase().includes(term) ||
            job.vehicle?.model?.toLowerCase().includes(term) ||
            job.vehicle?.plate_number?.toLowerCase().includes(term) ||
            job.vehicle?.chassis_number?.toLowerCase().includes(term)
        )
    }, [jobs, searchTerm])

    const toggleWorkerForService = (serviceId, workerId) => {
        setSelectedWorkers((prev) => {
            const current = prev[serviceId] || []
            const exists = current.includes(workerId)
            return {
                ...prev,
                [serviceId]: exists
                    ? current.filter((id) => id !== workerId)
                    : [...current, workerId],
            }
        })
    }

    // Reset worker selections whenever the selected job changes
    const handleSelectJob = (job) => {
        setSelectedJob(job)
        setSelectedWorkers({})
    }

    const confirmedJobsCount = useMemo(
        () => jobs.filter((job) => job.status === 'confirmed').length,
        [jobs]
    )

    const hasActiveSearch = searchTerm.trim().length > 0

    const handleAssignWorkers = async () => {
        if (!selectedJob) return

        // Build payload: one entry per service that has at least one worker selected
        const payload = selectedJob.services
            .map((service) => ({
                repair_job_id: selectedJob.id,
                repair_job_service_id: service.pivot?.id,
                worker_ids: selectedWorkers[service.id] || [],
            }))
            .filter((entry) => entry.repair_job_service_id && entry.worker_ids.length > 0)

        if (payload.length === 0) {
            setSubmitError('Please assign at least one worker to a service before saving.')
            return
        }

        setSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(false)

        try {
            await $api('/assign-workers', {
                method: 'POST',
                body: JSON.stringify(payload),
            })
            setSubmitSuccess(true)
            setSelectedWorkers({})
        } catch (error) {
            setSubmitError(
                error?.message || 'Failed to assign workers. Please try again.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
        >
            <button
                type="button"
                onClick={() => navigate('/repair/assigned')}
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4 cursor-pointer"
            >
                <ArrowLeft size={16} />
                Back to assigned jobs
            </button>

            <h1 className="text-2xl font-bold text-white">Assign Worker</h1>
            <p className="text-sm text-slate-400 mt-1 mb-6">
                Select a confirmed repair job and assign workers to each service.
            </p>

            {jobsLoading && jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
                    <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-sky-500 animate-spin" />
                    <span className="text-sm">Loading repair jobs...</span>
                </div>
            ) : confirmedJobsCount === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 bg-slate-900 border border-slate-800/80 rounded-2xl">
                    <span className="flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-950 border border-slate-800 text-slate-600">
                        <ClipboardList size={24} />
                    </span>
                    <div className="text-center max-w-sm">
                        <p className="text-white font-semibold text-base">No confirmed jobs yet</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Jobs must be confirmed before you can assign workers. Check back once a customer completes their down payment.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/repair/assigned')}
                        className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={15} />
                        Go to assigned jobs
                    </button>
                </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Selection Panel */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 h-fit">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by vehicle, plate, or chassis number..."
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50"
                        />
                        {hasActiveSearch && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Job List */}
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => {
                                const isSelected = selectedJob?.id === job.id
                                return (
                                    <button
                                        key={job.id}
                                        onClick={() => handleSelectJob(job)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${isSelected
                                            ? 'border-sky-500/50 bg-sky-500/10'
                                            : 'border-slate-800 bg-slate-950/30 hover:bg-slate-800/30 hover:border-slate-700'
                                            }`}
                                    >
                                        <span
                                            className={`flex items-center justify-center h-9 w-9 rounded-lg border shrink-0 ${isSelected
                                                ? 'bg-sky-500/20 border-sky-500/30 text-sky-400'
                                                : 'bg-slate-900/90 border-slate-800 text-slate-500'
                                                }`}
                                        >
                                            <Car size={15} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm text-slate-200 capitalize truncate">
                                                {job.vehicle?.brand} {job.vehicle?.model}
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-mono uppercase mt-0.5">
                                                {job.vehicle?.plate_number || 'N/A'}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
                                        )}
                                    </button>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-slate-500 py-10 px-4">
                                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-slate-950 border border-slate-800 text-slate-600">
                                    <Search size={18} />
                                </span>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-400">No jobs match your search</p>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Try a different plate, brand, or chassis number.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Job Details Panel */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-slate-300 mb-4">Job Details</h2>

                    <AnimatePresence mode="wait">
                        {selectedJob ? (
                            <motion.div
                                key={selectedJob.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                                        <Car size={17} />
                                    </span>
                                    <div>
                                        <div className="font-semibold text-white capitalize">
                                            {selectedJob.vehicle?.brand} {selectedJob.vehicle?.model}
                                        </div>
                                        <div className="text-[11px] text-slate-500 capitalize">
                                            {selectedJob.vehicle?.body_type || 'Unknown Type'} • {selectedJob.vehicle?.engine_type}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                        <div className="text-slate-500 mb-1">Plate Number</div>
                                        <div className="font-mono text-slate-200 uppercase">
                                            {selectedJob.vehicle?.plate_number || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                        <div className="text-slate-500 mb-1">Chassis Number</div>
                                        <div className="font-mono text-slate-200 uppercase">
                                            {selectedJob.vehicle?.chassis_number || '—'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                        <div className="text-slate-500 mb-1">Estimated Cost</div>
                                        <div className="font-mono text-slate-200">
                                            ${selectedJob.estimated_cost || 0}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                        <div className="text-slate-500 mb-1">Status</div>
                                        <div className="text-slate-200 capitalize">
                                            {selectedJob.status?.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                                {/* Services stacked, each with its own worker assignment form */}
                                <div>
                                    <div className="text-slate-500 text-xs mb-2">Requested Services</div>

                                    {selectedJob.services && selectedJob.services.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedJob.services.map((service) => {
                                                const assignedIds = selectedWorkers[service.id] || []
                                                const requiredTypeName = getRequiredWorkerTypeName(service)
                                                const eligibleWorkers = getEligibleWorkersForService(
                                                    workers,
                                                    service
                                                )
                                                return (
                                                    <div
                                                        key={service.id}
                                                        className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-4"
                                                    >
                                                        {/* Service header */}
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-sky-400 shrink-0">
                                                                    <Wrench size={13} />
                                                                </span>
                                                                <div>
                                                                    <div className="text-sm font-medium text-slate-200">
                                                                        {service.name}
                                                                    </div>
                                                                    {requiredTypeName && (
                                                                        <div className="text-[10px] text-slate-500 capitalize">
                                                                            Requires: {requiredTypeName.replace(/_/g, ' ')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {assignedIds.length > 0 && (
                                                                <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-0.5">
                                                                    {assignedIds.length} assigned
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Worker selection */}
                                                        {loading ? (
                                                            <div className="text-[11px] text-slate-500 italic">
                                                                Loading workers...
                                                            </div>
                                                        ) : eligibleWorkers.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {eligibleWorkers.map((worker) => {
                                                                    const isChecked = assignedIds.includes(worker.id)
                                                                    return (
                                                                        <button
                                                                            key={worker.id}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                toggleWorkerForService(service.id, worker.id)
                                                                            }
                                                                            className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${isChecked
                                                                                ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                                                                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                                                                                }`}
                                                                        >
                                                                            <span
                                                                                className={`flex items-center justify-center h-4 w-4 rounded-full border shrink-0 ${isChecked
                                                                                    ? 'bg-sky-500 border-sky-500 text-white'
                                                                                    : 'border-slate-700 text-transparent'
                                                                                    }`}
                                                                            >
                                                                                <Check size={10} strokeWidth={3} />
                                                                            </span>
                                                                            <User size={11} className="opacity-60" />
                                                                            {worker.name}
                                                                            {workers.filter(w => w.name === worker.name).length > 1 && (
                                                                                <span className="text-slate-500">({worker.email.split('@')[0]})</span>
                                                                            )}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-slate-800 bg-slate-950/60 px-3 py-2.5">
                                                                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                                                                    {getRequiredWorkerTypeId(service) == null ? (
                                                                        <AlertCircle size={13} className="text-amber-400" />
                                                                    ) : (
                                                                        <UserX size={13} className="text-slate-500" />
                                                                    )}
                                                                </span>
                                                                <div>
                                                                    <p className="text-xs font-medium text-slate-400">
                                                                        {getRequiredWorkerTypeId(service) == null
                                                                            ? 'Worker type not configured'
                                                                            : 'No matching workers available'}
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                                                        {getRequiredWorkerTypeId(service) == null
                                                                            ? 'This service needs a required worker type before assignments can be made.'
                                                                            : requiredTypeName
                                                                                ? `Add a worker with the "${requiredTypeName.replace(/_/g, ' ')}" type in Manage → Workers.`
                                                                                : 'No workers match the required type for this service.'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 italic text-[11px]">
                                            No baseline services
                                        </span>
                                    )}
                                </div>

                                {/* Submit assignment */}
                                <button
                                    type="button"
                                    onClick={handleAssignWorkers}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
                                >
                                    {submitting ? 'Saving...' : 'Save Assignments'}
                                </button>

                                {submitError && (
                                    <p className="text-[11px] text-red-400 mt-2">{submitError}</p>
                                )}
                                {submitSuccess && (
                                    <p className="text-[11px] text-green-400 mt-2">Workers assigned successfully.</p>
                                )}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-500 py-16 px-4">
                                <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 text-slate-600">
                                    <ClipboardList size={22} />
                                </span>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-400">No job selected</p>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Pick a confirmed job from the list to assign workers.
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            )}
        </motion.div>
    )
}

export default AssignWorker