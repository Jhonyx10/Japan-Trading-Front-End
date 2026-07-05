import { motion } from 'framer-motion'
import { $api } from '../../../api/client'
import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, UserCheck, Loader2, ArrowBigRight, Car, Search } from 'lucide-react'
import Pagination from '../../../components/Pagination'

const STATUS_STYLES = {
    assigned: 'border-sky-900/50 bg-sky-900/20 text-sky-400 [&>span]:bg-sky-500',
    in_progress: 'border-amber-900/50 bg-amber-900/20 text-amber-400 [&>span]:bg-amber-500',
    completed: 'border-green-900/50 bg-green-900/20 text-green-400 [&>span]:bg-green-500',
}

const getStatusStyle = (status) =>
    STATUS_STYLES[status] || 'border-slate-800 bg-slate-900/40 text-slate-400 [&>span]:bg-slate-500'

const STAT_CARDS = [
    { key: 'total', label: 'Confirmed', icon: ClipboardList, accent: 'text-slate-300', ring: 'bg-slate-800/80 border-slate-700/50' },
    { key: 'assigned', label: 'Assigned', icon: UserCheck, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
    { key: 'in_progress', label: 'In Progress', icon: Loader2, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
]

const AssignedJobs = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const itemsPerPage = 5
    const navigate = useNavigate()

    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ['assigned-jobs'],
        queryFn: () => $api('/repair-jobs/repair'),
    })

    const filteredJobs = useMemo(() => {
        if (!searchTerm.trim()) return jobs

        const term = searchTerm.toLowerCase()
        return jobs.filter((job) =>
            job.vehicle?.brand?.toLowerCase().includes(term) ||
            job.vehicle?.model?.toLowerCase().includes(term) ||
            job.vehicle?.plate_number?.toLowerCase().includes(term) ||
            job.vehicle?.chassis_number?.toLowerCase().includes(term) ||
            String(job.id).includes(term)
        )
    }, [jobs, searchTerm])

    const hasActiveSearch = searchTerm.trim().length > 0

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const counts = {
        total: jobs.filter((job) => job.status === 'confirmed').length,
        assigned: jobs.filter((job) => job.status === 'assigned').length,
        in_progress: jobs.filter((job) => job.status === 'in_progress').length,
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg font-semibold tracking-tight text-white">Assigned Jobs</h1>
                <button
                    onClick={() => navigate('/assign-worker', { state: { jobs } })}
                    className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
                    Assign Job
                    <ArrowBigRight size={15} />
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, vehicle, plate, or chassis..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-16 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50"
                />
                {hasActiveSearch && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {STAT_CARDS.map(({ key, label, icon: Icon, accent, ring }) => (
                    <div
                        key={key}
                        className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/70 rounded-xl p-4"
                    >
                        <span className={`flex items-center justify-center h-9 w-9 rounded-lg border shrink-0 ${ring} ${accent}`}>
                            <Icon size={16} className={key === 'in_progress' ? 'animate-spin [animation-duration:2.5s]' : ''} />
                        </span>
                        <div className="min-w-0">
                            <div className={`text-xl font-semibold leading-none ${accent}`}>{counts[key]}</div>
                            <div className="text-[11px] text-slate-500 mt-1 truncate">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                            <th className="py-3.5 px-4 w-16">ID</th>
                            <th className="py-3.5 px-4">Vehicle</th>
                            <th className="py-3.5 px-4">Plate Number</th>
                            <th className="py-3.5 px-4">Chassis Number</th>
                            <th className="py-3.5 px-4">Requested Services</th>
                            <th className="py-3.5 px-4">Assigned Workers</th>
                            <th className="py-3.5 px-4 text-right">Estimated Cost</th>
                            <th className="py-3.5 px-4 text-center w-32">Status</th>
                            <th className="py-3.5 px-4 text-center w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                        {isLoading ? (
                            <tr>
                                <td colSpan="9" className="p-10 text-center">
                                    <span className="text-slate-500 italic text-xs">Loading jobs...</span>
                                </td>
                            </tr>
                        ) : currentJobs.length > 0 ? (
                            currentJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-800/20 group transition-colors duration-150">
                                    {/* Job ID */}
                                    <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                        #{job.id}
                                    </td>

                                    {/* Vehicle Details */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shrink-0">
                                                <Car size={13} />
                                            </span>
                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-200 capitalize group-hover:text-white transition-colors">
                                                    {job.vehicle?.brand} {job.vehicle?.model}
                                                </div>
                                                <div className="text-[10px] text-slate-500 capitalize mt-0.5">
                                                    {job.vehicle?.body_type || 'Unknown Type'} • {job.vehicle?.engine_type}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Plate Number */}
                                    <td className="p-4">
                                        <span className="font-mono text-xs uppercase bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-slate-300">
                                            {job.vehicle?.plate_number || 'N/A'}
                                        </span>
                                    </td>

                                    {/* Chassis Number */}
                                    <td className="p-4 font-mono text-slate-400 text-xs uppercase tracking-wide">
                                        {job.vehicle?.chassis_number || '—'}
                                    </td>

                                    {/* Requested Services Tags */}
                                    <td className="p-4 max-w-xs">
                                        <div className="flex flex-wrap gap-1.5">
                                            {job.services && job.services.length > 0 ? (
                                                job.services.map((service) => (
                                                    <span
                                                        key={service.id}
                                                        className="text-[10px] font-medium bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 text-nowrap"
                                                    >
                                                        {service.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-500 italic text-[11px]">No baseline services</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5">
                                            {job.services && job.services.some(s => s.workers?.length > 0) ? (
                                                job.services.map((service) =>
                                                    service.workers && service.workers.length > 0 ? (
                                                        <div key={service.id} className="flex flex-wrap items-center gap-1">
                                                            <span className="text-[9px] text-slate-500 uppercase tracking-wide shrink-0">
                                                                {service.name}:
                                                            </span>
                                                            {service.workers.map((worker) => (
                                                                <span
                                                                    key={worker.id}
                                                                    className="text-[10px] font-medium bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                                                                >
                                                                    {worker.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : null
                                                )
                                            ) : (
                                                <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                                            )}
                                        </div>
                                    </td>
                                    {/* Estimated Cost */}
                                    <td className="p-4 text-right font-semibold text-slate-200 font-mono tabular-nums">
                                        ${job.estimated_cost || 0}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getStatusStyle(job.status)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"></span>
                                            {job.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => navigate(`/repair-job/${job.id}`)}
                                            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
                                            View Job
                                            <ArrowBigRight size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-500">
                                        <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 text-slate-600">
                                            {hasActiveSearch ? (
                                                <Search size={20} />
                                            ) : (
                                                <ClipboardList size={20} />
                                            )}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-400">
                                                {hasActiveSearch
                                                    ? 'No jobs match your search'
                                                    : 'No repair jobs found'}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                {hasActiveSearch
                                                    ? 'Try a different keyword or clear the search.'
                                                    : 'Jobs will appear here once customers book repairs.'}
                                            </p>
                                        </div>
                                        {hasActiveSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchTerm('')}
                                                className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredJobs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="jobs"
                summaryExtra={
                    hasActiveSearch ? (
                        <span className="text-slate-600"> (filtered from {jobs.length})</span>
                    ) : null
                }
            />
        </motion.div>
    )
}

export default AssignedJobs