import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { $api } from '../../../api/client'
import { useLocation } from 'react-router-dom'
import { Search, Car, CheckCircle2, ClipboardList, Wrench, User, Check } from 'lucide-react'

const AssignWorker = () => {
    const location = useLocation()
    const jobs = location.state?.jobs || []
    const [workers, setWorkers] = useState([])
    // { [serviceId]: [workerId, workerId, ...] }
    const [selectedWorkers, setSelectedWorkers] = useState({})
    const [selectedJob, setSelectedJob] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoading(true)
            try {
                const res = await $api('/users')
                setWorkers(res)
            } catch (error) {
                setWorkers([])
            } finally {
                setLoading(false)
            }
        }
        fetchWorkers()
    }, [])

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

    if (confirmedJobsCount === 0) {
        return (
            <div className="p-6 text-slate-400">
                No confirmed jobs to assign. Please go back and select confirmed jobs.
            </div>
        )
    }

    if (filteredJobs.length === 0) {
        return (
            <div className="p-6 text-slate-400">
                No confirmed jobs to assign. Please go back and select confirmed jobs.
            </div>
        )
    }

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
            <h1 className="text-2xl font-bold text-white">Assign Worker</h1>
            <p className="text-sm text-slate-400 mt-1 mb-6">
                Please select a repair job to assign a worker to.
            </p>

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
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50"
                        />
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
                            <div className="flex flex-col items-center gap-2 text-slate-500 py-10">
                                <ClipboardList size={20} className="text-slate-700" />
                                <span className="italic text-xs">No jobs match your search.</span>
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
                                                const eligibleWorkers = workers.filter(
                                                    (w) => w.role_id === service.required_role?.id
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
                                                                    {service.required_role && (
                                                                        <div className="text-[10px] text-slate-500 capitalize">
                                                                            Requires: {service?.required_role?.name}
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
                                                            <div className="text-[11px] text-slate-500 italic">
                                                                No available workers with the required role.
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
                            <div className="flex flex-col items-center justify-center gap-2 text-slate-500 py-16">
                                <ClipboardList size={20} className="text-slate-700" />
                                <span className="italic text-xs">Select a job to view details.</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

export default AssignWorker