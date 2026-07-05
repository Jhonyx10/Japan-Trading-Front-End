import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    DollarSign,
    Wrench,
    AlertCircle,
    Car,
    Package,
    ClipboardList,
    Users,
    FileText,
    CreditCard,
    Loader2,
    TrendingUp,
} from 'lucide-react'
import { $api } from '../../api/client'

const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '—'
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

const ACTIVITY_ICONS = {
    payment: CreditCard,
    repair: Wrench,
    inventory: Package,
}

const ACTIVITY_STATUS_STYLES = {
    successful: 'text-green-400 bg-green-500/10 border-green-500/20',
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    failed: 'text-red-400 bg-red-500/10 border-red-500/20',
    in: 'text-green-400 bg-green-500/10 border-green-500/20',
    out: 'text-red-400 bg-red-500/10 border-red-500/20',
    assigned: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    completed: 'text-green-400 bg-green-500/10 border-green-500/20',
    confirmed: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    pending_request: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

const REPAIR_STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
}

const DashboardPage = () => {
    const navigate = useNavigate()

    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await $api('/dashboard')
            return res?.data ?? res
        },
    })

    const stats = data?.stats ?? {}
    const repairBreakdown = data?.repair_breakdown ?? {}
    const activities = data?.recent_activities ?? []

    const primaryStats = [
        {
            key: 'total_collected',
            label: 'Total Collected',
            value: formatCurrency(stats.total_collected),
            icon: DollarSign,
            accent: 'text-emerald-400',
            ring: 'bg-emerald-500/10 border-emerald-500/20',
            path: '/invoices/transactions',
        },
        {
            key: 'active_repairs',
            label: 'Active Repairs',
            value: stats.active_repairs ?? 0,
            icon: Wrench,
            accent: 'text-sky-400',
            ring: 'bg-sky-500/10 border-sky-500/20',
            path: '/repair/assigned',
        },
        {
            key: 'outstanding_due',
            label: 'Outstanding Due',
            value: formatCurrency(stats.outstanding_due),
            icon: AlertCircle,
            accent: 'text-amber-400',
            ring: 'bg-amber-500/10 border-amber-500/20',
            path: '/invoices/contracts',
        },
        {
            key: 'vehicles_for_sale',
            label: 'Vehicles For Sale',
            value: stats.vehicles_for_sale ?? 0,
            icon: Car,
            accent: 'text-violet-400',
            ring: 'bg-violet-500/10 border-violet-500/20',
            path: '/vehicles',
        },
    ]

    const secondaryStats = [
        {
            key: 'pending_requests',
            label: 'Pending Requests',
            value: stats.pending_requests ?? 0,
            icon: ClipboardList,
            path: '/repair/requests',
        },
        {
            key: 'low_stock_items',
            label: 'Low Stock Items',
            value: stats.low_stock_items ?? 0,
            icon: Package,
            path: '/inventory/stocks',
        },
        {
            key: 'total_invoices',
            label: 'Total Invoices',
            value: stats.total_invoices ?? 0,
            icon: FileText,
            path: '/invoices/contracts',
        },
        {
            key: 'total_workers',
            label: 'Active Workers',
            value: stats.total_workers ?? 0,
            icon: Users,
            path: '/manage/workers',
        },
    ]

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 mb-1">
                            Operations Overview
                        </p>
                        <h2 className="text-2xl font-bold text-white">Japan Trading Dashboard</h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Live metrics from repairs, sales, inventory, and payments.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <TrendingUp size={16} className="text-emerald-400" />
                        <span className="text-xs text-slate-400">Real-time data</span>
                    </div>
                </div>
            </motion.div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
                    <Loader2 size={28} className="animate-spin text-sky-500" />
                    <span className="text-sm">Loading dashboard...</span>
                </div>
            )}

            {isError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    Failed to load dashboard data. Please try again.
                </div>
            )}

            {!isLoading && !isError && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {primaryStats.map(({ key, label, value, icon: Icon, accent, ring, path }, index) => (
                            <motion.button
                                key={key}
                                type="button"
                                onClick={() => navigate(path)}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                                whileHover={{ y: -3 }}
                                className="text-left bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`flex items-center justify-center h-10 w-10 rounded-xl border ${ring} ${accent}`}
                                    >
                                        <Icon size={18} />
                                    </span>
                                </div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    {label}
                                </p>
                                <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
                            </motion.button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {secondaryStats.map(({ key, label, value, icon: Icon, path }, index) => (
                            <motion.button
                                key={key}
                                type="button"
                                onClick={() => navigate(path)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.2 + index * 0.05 }}
                                className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/70 rounded-xl p-4 hover:bg-slate-900/60 transition-colors cursor-pointer text-left"
                            >
                                <span className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 shrink-0">
                                    <Icon size={16} />
                                </span>
                                <div>
                                    <p className="text-lg font-semibold text-white leading-none">{value}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{label}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
                        >
                            <h3 className="text-sm font-semibold text-white mb-4">Repair Job Status</h3>
                            <div className="space-y-2.5">
                                {Object.entries(repairBreakdown).map(([status, count]) => (
                                    <div
                                        key={status}
                                        className="flex items-center justify-between gap-3 text-xs"
                                    >
                                        <span className="text-slate-400 capitalize">
                                            {REPAIR_STATUS_LABELS[status] ?? status.replace(/_/g, ' ')}
                                        </span>
                                        <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                                            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-sky-500/80"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            (count /
                                                                Math.max(
                                                                    ...Object.values(repairBreakdown),
                                                                    1
                                                                )) *
                                                                100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="font-mono text-slate-300 w-6 text-right">
                                                {count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                                <button
                                    type="button"
                                    onClick={() => navigate('/invoices/transactions')}
                                    className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                                >
                                    View transactions
                                </button>
                            </div>

                            {activities.length > 0 ? (
                                <div className="divide-y divide-slate-800/60">
                                    {activities.map((act) => {
                                        const Icon = ACTIVITY_ICONS[act.type] ?? ClipboardList
                                        const statusClass =
                                            ACTIVITY_STATUS_STYLES[act.status] ??
                                            'text-slate-400 bg-slate-500/10 border-slate-500/20'

                                        return (
                                            <div
                                                key={act.id}
                                                className="flex justify-between items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <span className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 shrink-0 mt-0.5">
                                                        <Icon size={14} />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-slate-200 truncate">
                                                            {act.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                            {act.description}
                                                        </p>
                                                        <p className="text-[10px] text-slate-600 mt-1">
                                                            {formatRelativeTime(act.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusClass}`}
                                                >
                                                    {String(act.status).replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-500 text-sm italic">
                                    No recent activity yet.
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DashboardPage
