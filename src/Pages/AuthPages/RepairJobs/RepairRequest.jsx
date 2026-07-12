import { motion } from 'framer-motion'
import { $api } from '../../../api/client'
import { formatCurrency } from '../../../utils/currency'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Pagination from '../../../components/Pagination'
import { useNavigate } from 'react-router-dom'

const RepairRequest = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const itemsPerPage = 5
    const navigate = useNavigate()

    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ['repair-jobs'],
        queryFn: () => $api('/repair-jobs'),
    })

    // Filter by reference number or plate number
    const filteredJobs = jobs.filter((job) => {
        const term = searchTerm.toLowerCase()
        const reference = (job.reference_number || '').toLowerCase()
        const plate = (job.vehicle?.plate_number || '').toLowerCase()
        return reference.includes(term) || plate.includes(term)
    })

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 text-slate-100 shadow-xl shadow-slate-950/20"
        >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-white">Repair Requests</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Manage and track ongoing vehicle workshop operations.</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 font-medium">
                        Total Records: <span className="text-sky-400 font-semibold">{jobs.length}</span>
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                 <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                    }}
                    placeholder="Search by reference or plate number..."
                    className="w-full sm:w-72 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                />
            </div>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                            <th className="py-3.5 px-4 w-16">ID</th>
                            <th className="py-3.5 px-4">Reference No.</th>
                            <th className="py-3.5 px-4">Vehicle</th>
                            <th className="py-3.5 px-4">Plate Number</th>
                            <th className="py-3.5 px-4">Chassis Number</th>
                            <th className="py-3.5 px-4">Requested Services</th>
                            <th className="py-3.5 px-4 text-right">Estimated Cost</th>
                            <th className="py-3.5 px-4 text-center w-32">Status</th>
                            <th className="py-3.5 px-4 text-center w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="p-12 text-center text-slate-500 italic tracking-wide">
                                    Loading repair requests...
                                </td>
                            </tr>
                        ) : currentJobs.length > 0 ? (
                            currentJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-800/20 group transition-colors duration-150">
                                    {/* Job ID */}
                                    <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                        #{job.id}
                                    </td>

                                    {/* Reference Number */}
                                    <td className="p-4">
                                        <span className="font-mono text-xs uppercase bg-sky-500/5 px-2 py-1 rounded border border-sky-500/10 text-sky-300">
                                            {job.reference_number || 'N/A'}
                                        </span>
                                    </td>

                                    {/* Vehicle Details */}
                                    <td className="p-4">
                                        <div className="font-medium text-slate-200 capitalize group-hover:text-white transition-colors">
                                            {job.vehicle?.brand} {job.vehicle?.model}
                                        </div>
                                        <div className="text-[10px] text-slate-500 capitalize mt-0.5">
                                            {job.vehicle?.body_type || 'Unknown Type'} • {job.vehicle?.engine_type}
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

                                    {/* Financial Cost */}
                                    <td className="p-4 font-mono text-right text-slate-200 font-medium">
                                        {job.total_estimated_cost && parseFloat(job.total_estimated_cost) > 0 ? (
                                            <span className="text-emerald-400 text-sm">
                                                {formatCurrency(job.total_estimated_cost)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 italic text-[11px] bg-slate-900/40 border border-slate-800/40 px-2 py-0.5 rounded">
                                                TBD Quote
                                            </span>
                                        )}
                                    </td>

                                    {/* Lifecycle Status */}
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/5 text-amber-400 border border-amber-500/10 capitalize shadow-inner shadow-amber-500/5">
                                            <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => navigate(`/repair-job/${job.id}`)}
                                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="p-12 text-center text-slate-500 italic tracking-wide">
                                    No repair requests found.
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
            />
        </motion.div>
    )
}

export default RepairRequest