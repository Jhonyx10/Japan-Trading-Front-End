import { motion } from 'framer-motion'
import { $api } from '../../../api/client'
import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    History,
    CheckCircle2,
    XCircle,
    PhilippinePeso,
    Calendar,
    Car,
    Search,
    ArrowBigRight,
    FileText,
    Clock,
} from 'lucide-react'
import Pagination from '../../../components/Pagination'
import { formatCurrency } from '../../../utils/currency'

const STATUS_STYLES = {
    completed: 'border-green-900/50 bg-green-900/20 text-green-400 [&>span]:bg-green-500',
    cancelled: 'border-red-900/50 bg-red-900/20 text-red-400 [&>span]:bg-red-500',
}

const INVOICE_STATUS_STYLES = {
    paid: 'text-green-400 bg-green-500/10 border-green-500/20',
    unpaid: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    partially_paid: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    partial: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    overdue: 'text-red-400 bg-red-500/10 border-red-500/20',
    pending: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

const getStatusStyle = (status) =>
    STATUS_STYLES[status] || 'border-slate-800 bg-slate-900/40 text-slate-400 [&>span]:bg-slate-500'

const getInvoiceStatusStyle = (status) =>
    INVOICE_STATUS_STYLES[status] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const getDuration = (start, end) => {
    if (!start || !end) return '—'
    const days = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)))
    return `${days} day${days !== 1 ? 's' : ''}`
}

const isThisMonth = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

const getFinishedDate = (job) => job.end_date || job.updated_at

const getFinalCost = (job) => job.invoice?.total_amount ?? job.total_estimated_cost ?? 0

const getAllWorkers = (job) => {
    const names = new Set()
    job.services?.forEach((service) => {
        service.workers?.forEach((w) => names.add(w.name))
    })
    return [...names]
}

const RepairHistory = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [paymentFilter, setPaymentFilter] = useState('all')
    const itemsPerPage = 5
    const navigate = useNavigate()

    const { data, isLoading } = useQuery({
        queryKey: ['repair-history'],
        queryFn: async () => {
            const response = await $api('/repair-jobs/history')
            if (Array.isArray(response)) return response
            if (Array.isArray(response?.data)) return response.data
            return []
        },
    })

    const jobs = useMemo(() => (Array.isArray(data) ? data : []), [data])

    const filteredJobs = useMemo(() => {
        let result = jobs

        if (statusFilter !== 'all') {
            result = result.filter((job) => job.status === statusFilter)
        }

        if (paymentFilter !== 'all') {
            result = result.filter((job) => {
                const invStatus = job.invoice?.status ?? 'none'
                if (paymentFilter === 'paid') return invStatus === 'paid'
                if (paymentFilter === 'unpaid') return ['unpaid', 'partially_paid', 'partial', 'overdue', 'pending'].includes(invStatus)
                if (paymentFilter === 'none') return !job.invoice
                return true
            })
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            result = result.filter(
                (job) =>
                    job.vehicle?.brand?.toLowerCase().includes(term) ||
                    job.vehicle?.model?.toLowerCase().includes(term) ||
                    job.vehicle?.plate_number?.toLowerCase().includes(term) ||
                    job.vehicle?.chassis_number?.toLowerCase().includes(term) ||
                    job.invoice?.invoice_number?.toLowerCase().includes(term) ||
                    String(job.id).includes(term)
            )
        }

        return result
    }, [jobs, searchTerm, statusFilter, paymentFilter])

    const hasActiveFilters =
        searchTerm.trim().length > 0 || statusFilter !== 'all' || paymentFilter !== 'all'

    const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage))
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter, paymentFilter])

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages)
    }, [currentPage, totalPages])

    const completedJobs = jobs.filter((j) => j.status === 'completed')
    const counts = {
        total: completedJobs.length,
        thisMonth: completedJobs.filter((j) => isThisMonth(getFinishedDate(j))).length,
        cancelled: jobs.filter((j) => j.status === 'cancelled').length,
        totalBilled: completedJobs.reduce((sum, j) => sum + Number(getFinalCost(j)), 0),
    }

    const STAT_CARDS = [
        { key: 'total', label: 'Completed', value: counts.total, icon: CheckCircle2, accent: 'text-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/20' },
        { key: 'thisMonth', label: 'This Month', value: counts.thisMonth, icon: Calendar, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
        { key: 'cancelled', label: 'Cancelled', value: counts.cancelled, icon: XCircle, accent: 'text-red-400', ring: 'bg-red-500/10 border-red-500/20' },
        { key: 'totalBilled', label: 'Total Billed', value: formatCurrency(counts.totalBilled), icon: PhilippinePeso, accent: 'text-violet-400', ring: 'bg-violet-500/10 border-violet-500/20' },
    ]

    const clearFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setPaymentFilter('all')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
        >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-white">Repair History</h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Archive of completed and cancelled repair jobs.
                    </p>
                </div>
                <span className="text-xs bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 font-medium self-start sm:self-auto">
                    Total Records: <span className="text-sky-400 font-semibold">{jobs.length}</span>
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {STAT_CARDS.map(({ key, label, value, icon: Icon, accent, ring }) => (
                    <div
                        key={key}
                        className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/70 rounded-xl p-4"
                    >
                        <span className={`flex items-center justify-center h-9 w-9 rounded-lg border shrink-0 ${ring} ${accent}`}>
                            <Icon size={16} />
                        </span>
                        <div className="min-w-0">
                            <div className={`text-xl font-semibold leading-none ${accent}`}>{value}</div>
                            <div className="text-[11px] text-slate-500 mt-1 truncate">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by ID, vehicle, plate, chassis, or invoice..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
                >
                    <option value="all">All statuses</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
                >
                    <option value="all">All payments</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Outstanding</option>
                    <option value="none">No invoice</option>
                </select>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-sky-400 hover:text-sky-300 px-3 py-2.5 cursor-pointer whitespace-nowrap"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className="overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                            <th className="py-3.5 px-4 w-16">ID</th>
                            <th className="py-3.5 px-4">Vehicle</th>
                            <th className="py-3.5 px-4">Services</th>
                            <th className="py-3.5 px-4">Workers</th>
                            <th className="py-3.5 px-4">Started</th>
                            <th className="py-3.5 px-4">Finished</th>
                            <th className="py-3.5 px-4">Duration</th>
                            <th className="py-3.5 px-4 text-right">Final Cost</th>
                            <th className="py-3.5 px-4">Invoice</th>
                            <th className="py-3.5 px-4 text-center">Status</th>
                            <th className="py-3.5 px-4 text-center w-36">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                        {isLoading ? (
                            <tr>
                                <td colSpan="11" className="p-12 text-center text-slate-500 italic">
                                    Loading repair history...
                                </td>
                            </tr>
                        ) : currentJobs.length > 0 ? (
                            currentJobs.map((job) => {
                                const workers = getAllWorkers(job)
                                const finished = getFinishedDate(job)

                                return (
                                    <tr key={job.id} className="hover:bg-slate-800/20 group transition-colors duration-150">
                                        <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400">
                                            #{job.id}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 shrink-0">
                                                    <Car size={13} />
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-200 capitalize">
                                                        {job.vehicle?.brand} {job.vehicle?.model}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
                                                        {job.vehicle?.plate_number || 'No plate'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-[160px]">
                                            <div className="flex flex-wrap gap-1">
                                                {job.services?.length > 0 ? (
                                                    job.services.map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="text-[10px] bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                                                        >
                                                            {s.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-500 italic">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-[140px]">
                                            {workers.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {workers.map((name) => (
                                                        <span
                                                            key={name}
                                                            className="text-[10px] bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                                                        >
                                                            {name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-400 whitespace-nowrap">
                                            {formatDate(job.start_date || job.created_at)}
                                        </td>
                                        <td className="p-4 text-slate-400 whitespace-nowrap">
                                            {formatDate(finished)}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 text-slate-400">
                                                <Clock size={11} />
                                                {getDuration(job.start_date || job.created_at, finished)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                                            {formatCurrency(getFinalCost(job))}
                                        </td>
                                        <td className="p-4">
                                            {job.invoice ? (
                                                <div className="space-y-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/invoices/${job.invoice.id}`)}
                                                        className="text-sky-400 hover:text-sky-300 font-mono text-[11px] cursor-pointer"
                                                    >
                                                        {job.invoice.invoice_number}
                                                    </button>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border capitalize ${getInvoiceStatusStyle(job.invoice.status)}`}
                                                    >
                                                        {job.invoice.status?.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic">No invoice</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getStatusStyle(job.status)}`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5" />
                                                {job.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5 items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/repair-job/${job.id}`)}
                                                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full justify-center"
                                                >
                                                    View Job
                                                    <ArrowBigRight size={12} />
                                                </button>
                                                {job.invoice && (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/invoices/${job.invoice.id}`)}
                                                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-[11px] font-medium px-3 py-1.5 cursor-pointer w-full justify-center"
                                                    >
                                                        <FileText size={12} />
                                                        Invoice
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan="11" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-500">
                                        <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 text-slate-600">
                                            {hasActiveFilters ? <Search size={20} /> : <History size={20} />}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-400">
                                                {hasActiveFilters
                                                    ? 'No records match your filters'
                                                    : 'No repair history yet'}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                {hasActiveFilters
                                                    ? 'Try adjusting your search or filters.'
                                                    : 'Completed and cancelled jobs will appear here.'}
                                            </p>
                                        </div>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                                            >
                                                Clear filters
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
                itemLabel="records"
                summaryExtra={
                    hasActiveFilters ? (
                        <span className="text-slate-600"> (filtered from {jobs.length})</span>
                    ) : null
                }
            />
        </motion.div>
    )
}

export default RepairHistory
