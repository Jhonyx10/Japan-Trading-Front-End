import { useQuery } from '@tanstack/react-query'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Package, AlertTriangle, Boxes, ArrowLeftRight } from 'lucide-react'
import { $api } from '../../../api/client'
import {
    ReportShell, StatGrid, ChartCard,
    formatCurrency, formatCompact,
    chartTooltipStyle, axisStyle, gridStyle,
} from '../../../components/reports/ReportShell'

const InventoryReport = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['report', 'inventory'],
        queryFn: async () => {
            const res = await $api('/reports/inventory')
            return res?.data ?? res
        },
    })

    const summary = data?.summary ?? {}
    const byCategory = data?.by_category ?? []
    const movementTrend = data?.movement_trend ?? []
    const lowStock = data?.low_stock_items ?? []

    const stats = [
        { key: 'items', label: 'Total Items', value: summary.total_items ?? 0, icon: Boxes, accent: 'text-slate-200', ring: 'bg-slate-800/80 border-slate-700/50' },
        { key: 'value', label: 'Stock Value', value: formatCurrency(summary.total_value), icon: Package, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
        { key: 'low', label: 'Low Stock', value: summary.low_stock_count ?? 0, icon: AlertTriangle, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
        { key: 'movements', label: 'Total Movements', value: summary.total_movements ?? 0, icon: ArrowLeftRight, accent: 'text-violet-400', ring: 'bg-violet-500/10 border-violet-500/20' },
    ]

    return (
        <ReportShell
            title="Inventory Report"
            subtitle="Stock levels, category value, and in/out movement trends."
            isLoading={isLoading}
            isError={isError}
        >
            <StatGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Stock Value by Category">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={byCategory}>
                            <CartesianGrid {...gridStyle} vertical={false} />
                            <XAxis dataKey="category" tick={axisStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                            <Tooltip {...chartTooltipStyle} formatter={(v) => [formatCurrency(v), 'Value']} />
                            <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Value" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Stock In vs Out (6 Months)">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={movementTrend}>
                            <CartesianGrid {...gridStyle} vertical={false} />
                            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                            <Tooltip {...chartTooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                            <Bar dataKey="in" fill="#34d399" radius={[4, 4, 0, 0]} name="Stock In" />
                            <Bar dataKey="out" fill="#fb7185" radius={[4, 4, 0, 0]} name="Stock Out" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {lowStock.length > 0 && (
                <ChartCard title="Low Stock Alert">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="py-2.5 px-3">Item</th>
                                    <th className="py-2.5 px-3">SKU</th>
                                    <th className="py-2.5 px-3">Category</th>
                                    <th className="py-2.5 px-3 text-right">Qty</th>
                                    <th className="py-2.5 px-3 text-right">Min Alert</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {lowStock.map((item) => (
                                    <tr key={item.sku} className="text-slate-300">
                                        <td className="py-2.5 px-3 font-medium">{item.name}</td>
                                        <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{item.sku}</td>
                                        <td className="py-2.5 px-3 text-slate-400">{item.category}</td>
                                        <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">{item.quantity}</td>
                                        <td className="py-2.5 px-3 text-right text-slate-500">{item.min_alert}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            )}
        </ReportShell>
    )
}

export default InventoryReport
