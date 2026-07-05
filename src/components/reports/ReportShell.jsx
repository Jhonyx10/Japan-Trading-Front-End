import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export const CHART_COLORS = [
    '#34d399', '#38bdf8', '#a78bfa', '#fbbf24', '#fb7185', '#818cf8', '#2dd4bf', '#f472b6',
]

export const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatCompact = (value) => {
    const n = Number(value || 0)
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
    return formatCurrency(n)
}

export const chartTooltipStyle = {
    contentStyle: {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#e2e8f0',
    },
    itemStyle: { color: '#e2e8f0' },
    labelStyle: { color: '#94a3b8', marginBottom: '4px' },
}

export const axisStyle = { fill: '#64748b', fontSize: 11 }
export const gridStyle = { stroke: '#1e293b', strokeDasharray: '3 3' }

export const ReportShell = ({ title, subtitle, children, isLoading, isError }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 pb-6"
    >
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 mb-1">Reports</p>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
                <Loader2 size={28} className="animate-spin text-sky-500" />
                <span className="text-sm">Loading report data...</span>
            </div>
        )}

        {isError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                Failed to load report. Please try again.
            </div>
        )}

        {!isLoading && !isError && children}
    </motion.div>
)

export const StatGrid = ({ stats }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ key, label, value, icon: Icon, accent, ring }) => (
            <div
                key={key}
                className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 rounded-xl p-4"
            >
                <span className={`flex items-center justify-center h-10 w-10 rounded-lg border shrink-0 ${ring} ${accent}`}>
                    <Icon size={18} />
                </span>
                <div className="min-w-0">
                    <p className={`text-xl font-bold leading-none ${accent}`}>{value}</p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{label}</p>
                </div>
            </div>
        ))}
    </div>
)

export const ChartCard = ({ title, children, className = '' }) => (
    <div className={`bg-slate-900 border border-slate-800/80 rounded-2xl p-5 ${className}`}>
        <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
        {children}
    </div>
)
