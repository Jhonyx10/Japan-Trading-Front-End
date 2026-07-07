import { useQuery } from '@tanstack/react-query'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Car, Tag, CheckCircle2, Wrench, PhilippinePeso } from 'lucide-react'
import { $api } from '../../../api/client'
import {
    ReportShell, StatGrid, ChartCard,
    formatCurrency, CHART_COLORS,
    chartTooltipStyle, axisStyle, gridStyle,
} from '../../../components/reports/ReportShell'

const STATUS_COLORS = {
    for_sale: '#34d399',
    for_repair: '#fbbf24',
    unavailable: '#64748b',
    on_hold: '#a78bfa',
    sold: '#38bdf8',
}

const VehiclesReport = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['report', 'vehicles'],
        queryFn: async () => {
            const res = await $api('/reports/vehicles')
            return res?.data ?? res
        },
    })

    const summary = data?.summary ?? {}
    const byStatus = data?.by_status ?? []
    const byBodyType = data?.by_body_type ?? []
    const monthlyAdded = data?.monthly_added ?? []

    const stats = [
        { key: 'total', label: 'Total Vehicles', value: summary.total_vehicles ?? 0, icon: Car, accent: 'text-slate-200', ring: 'bg-slate-800/80 border-slate-700/50' },
        { key: 'sale', label: 'For Sale', value: summary.for_sale ?? 0, icon: Tag, accent: 'text-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/20' },
        { key: 'sold', label: 'Sold', value: summary.sold ?? 0, icon: CheckCircle2, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
        { key: 'repair', label: 'For Repair', value: summary.for_repair ?? 0, icon: Wrench, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
    ]

    return (
        <ReportShell
            title="Vehicle Fleet Report"
            subtitle="Fleet composition, status distribution, and registration trends."
            isLoading={isLoading}
            isError={isError}
        >
            <StatGrid stats={stats} />

            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3">
                <PhilippinePeso size={16} className="text-emerald-400" />
                <span className="text-sm text-slate-400">Total listed value (for sale):</span>
                <span className="text-sm font-semibold text-emerald-400">{formatCurrency(summary.for_sale_value)}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Fleet by Status">
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
                                paddingAngle={3}
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

                <ChartCard title="Vehicles by Body Type">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={byBodyType}>
                            <CartesianGrid {...gridStyle} vertical={false} />
                            <XAxis dataKey="body_type" tick={axisStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip {...chartTooltipStyle} />
                            <Bar dataKey="count" fill="#a78bfa" radius={[6, 6, 0, 0]} name="Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="New Vehicles Added (6 Months)">
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthlyAdded}>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip {...chartTooltipStyle} />
                        <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} name="Added" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </ReportShell>
    )
}

export default VehiclesReport
