import { useQuery } from '@tanstack/react-query'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { FileText, DollarSign, AlertCircle, Percent, Receipt } from 'lucide-react'
import { $api } from '../../../api/client'
import {
    ReportShell, StatGrid, ChartCard,
    formatCurrency, formatCompact, CHART_COLORS,
    chartTooltipStyle, axisStyle, gridStyle,
} from '../../../components/reports/ReportShell'

const FinancialReport = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['report', 'financial'],
        queryFn: async () => {
            const res = await $api('/reports/financial')
            return res?.data ?? res
        },
    })

    const summary = data?.summary ?? {}
    const byStatus = data?.by_status ?? []
    const monthlyFinancial = data?.monthly_financial ?? []
    const byType = data?.by_type ?? []

    const stats = [
        { key: 'invoiced', label: 'Total Invoiced', value: formatCurrency(summary.total_invoiced), icon: FileText, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
        { key: 'collected', label: 'Total Collected', value: formatCurrency(summary.total_collected), icon: DollarSign, accent: 'text-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/20' },
        { key: 'outstanding', label: 'Outstanding', value: formatCurrency(summary.total_outstanding), icon: AlertCircle, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
        { key: 'rate', label: 'Collection Rate', value: `${summary.collection_rate ?? 0}%`, icon: Percent, accent: 'text-violet-400', ring: 'bg-violet-500/10 border-violet-500/20' },
    ]

    return (
        <ReportShell
            title="Financial Report"
            subtitle="Invoice totals, collections, outstanding balances, and payment performance."
            isLoading={isLoading}
            isError={isError}
        >
            <StatGrid stats={stats} />

            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3">
                <Receipt size={16} className="text-slate-500" />
                <span className="text-sm text-slate-400">Total invoices issued:</span>
                <span className="text-sm font-semibold text-white">{summary.invoice_count ?? 0}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Invoiced vs Collected (6 Months)">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={monthlyFinancial}>
                            <CartesianGrid {...gridStyle} vertical={false} />
                            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                            <Tooltip {...chartTooltipStyle} formatter={(v) => formatCurrency(v)} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                            <Line type="monotone" dataKey="invoiced" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} name="Invoiced" />
                            <Line type="monotone" dataKey="collected" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} name="Collected" />
                            <Line type="monotone" dataKey="outstanding" stroke="#fbbf24" strokeWidth={2} dot={{ r: 4 }} name="Outstanding" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Invoices by Status">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={byStatus.filter((s) => s.count > 0)}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={95}
                                paddingAngle={2}
                            >
                                {byStatus.filter((s) => s.count > 0).map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...chartTooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="Invoice Amount by Type">
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byType}>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="type" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                        <Tooltip {...chartTooltipStyle} formatter={(v) => [formatCurrency(v), 'Total']} />
                        <Bar dataKey="total" fill="#818cf8" radius={[6, 6, 0, 0]} name="Total" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </ReportShell>
    )
}

export default FinancialReport
