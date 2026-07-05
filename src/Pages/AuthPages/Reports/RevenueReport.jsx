import { useQuery } from '@tanstack/react-query'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { DollarSign, CreditCard, TrendingUp, Calendar } from 'lucide-react'
import { $api } from '../../../api/client'
import {
    ReportShell, StatGrid, ChartCard,
    formatCurrency, formatCompact, CHART_COLORS,
    chartTooltipStyle, axisStyle, gridStyle,
} from '../../../components/reports/ReportShell'

const RevenueReport = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['report', 'revenue'],
        queryFn: async () => {
            const res = await $api('/reports/revenue')
            return res?.data ?? res
        },
    })

    const summary = data?.summary ?? {}
    const monthlyTrend = data?.monthly_trend ?? []
    const byMethod = data?.by_method ?? []
    const byType = data?.by_type ?? []

    const stats = [
        { key: 'total', label: 'Total Collected', value: formatCurrency(summary.total_collected), icon: DollarSign, accent: 'text-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/20' },
        { key: 'txns', label: 'Transactions', value: summary.total_transactions ?? 0, icon: CreditCard, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
        { key: 'avg', label: 'Avg Payment', value: formatCurrency(summary.average_payment), icon: TrendingUp, accent: 'text-violet-400', ring: 'bg-violet-500/10 border-violet-500/20' },
        { key: 'month', label: 'This Month', value: formatCurrency(summary.this_month), icon: Calendar, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
    ]

    return (
        <ReportShell
            title="Revenue Report"
            subtitle="Payment collections, trends, and breakdown by method over the last 6 months."
            isLoading={isLoading}
            isError={isError}
        >
            <StatGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Monthly Revenue Trend">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyTrend}>
                            <CartesianGrid {...gridStyle} vertical={false} />
                            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                            <Tooltip {...chartTooltipStyle} formatter={(v) => [formatCurrency(v), 'Revenue']} />
                            <Bar dataKey="amount" fill="#34d399" radius={[6, 6, 0, 0]} name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Revenue by Payment Method">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={byMethod}
                                dataKey="amount"
                                nameKey="method"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={95}
                                paddingAngle={3}
                            >
                                {byMethod.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...chartTooltipStyle} formatter={(v) => formatCurrency(v)} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="Revenue by Payment Type">
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byType} layout="vertical">
                        <CartesianGrid {...gridStyle} horizontal={false} />
                        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                        <YAxis type="category" dataKey="type" tick={axisStyle} axisLine={false} tickLine={false} width={100} />
                        <Tooltip {...chartTooltipStyle} formatter={(v) => [formatCurrency(v), 'Amount']} />
                        <Bar dataKey="amount" fill="#38bdf8" radius={[0, 6, 6, 0]} name="Amount" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </ReportShell>
    )
}

export default RevenueReport
