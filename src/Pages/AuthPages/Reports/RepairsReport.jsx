import { useQuery } from '@tanstack/react-query'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { Wrench, CheckCircle, Clock, Percent, DollarSign } from 'lucide-react'
import { $api } from '../../../api/client'
import {
    ReportShell, StatGrid, ChartCard,
    formatCurrency, CHART_COLORS,
    chartTooltipStyle, axisStyle, gridStyle,
} from '../../../components/reports/ReportShell'

const STATUS_COLORS = {
    pending: '#94a3b8',
    confirmed: '#818cf8',
    assigned: '#38bdf8',
    in_progress: '#fbbf24',
    completed: '#34d399',
    cancelled: '#fb7185',
}

const RepairsReport = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['report', 'repairs'],
        queryFn: async () => {
            const res = await $api('/reports/repairs')
            return res?.data ?? res
        },
    })

    const summary = data?.summary ?? {}
    const byStatus = data?.by_status ?? []
    const monthlyCreated = data?.monthly_created ?? []
    const monthlyCompleted = data?.monthly_completed ?? []

    const mergedMonthly = monthlyCreated.map((row, i) => ({
        month: row.month,
        created: row.count,
        completed: monthlyCompleted[i]?.count ?? 0,
    }))

    const stats = [
        { key: 'total', label: 'Total Jobs', value: summary.total_jobs ?? 0, icon: Wrench, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
        { key: 'active', label: 'Active Jobs', value: summary.active_jobs ?? 0, icon: Clock, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
        { key: 'completed', label: 'Completed', value: summary.completed_jobs ?? 0, icon: CheckCircle, accent: 'text-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/20' },
        { key: 'rate', label: 'Completion Rate', value: `${summary.completion_rate ?? 0}%`, icon: Percent, accent: 'text-violet-400', ring: 'bg-violet-500/10 border-violet-500/20' },
    ]

    return (
        <ReportShell
            title="Repair Jobs Report"
            subtitle="Job volume, status distribution, and completion trends."
            isLoading={isLoading}
            isError={isError}
        >
            <StatGrid stats={stats} />

            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3">
                <DollarSign size={16} className="text-slate-500" />
                <span className="text-sm text-slate-400">Average estimated cost:</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(summary.avg_estimated_cost)}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Jobs by Status">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={byStatus.filter((s) => s.count > 0)}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={95}
                                paddingAngle={2}
                            >
                                {byStatus.filter((s) => s.count > 0).map((entry) => (
                                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[0]} />
                                ))}
                            </Pie>
                            <Tooltip {...chartTooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Created vs Completed (6 Months)">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={mergedMonthly}>
                            <CartesianGrid {...gridStyle} vertical={false} />
                            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip {...chartTooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                            <Line type="monotone" dataKey="created" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} name="Created" />
                            <Line type="monotone" dataKey="completed" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} name="Completed" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="New Jobs per Month">
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthlyCreated}>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip {...chartTooltipStyle} />
                        <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} name="Jobs" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </ReportShell>
    )
}

export default RepairsReport
