import { motion } from 'framer-motion'
import { $api } from '../../../api/client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, ArrowDownCircle, ArrowUpCircle, History, PackagePlus, UserCircle } from 'lucide-react'
import RestockModal from '../../../components/modals/RestockModal'
import Pagination from '../../../components/Pagination'

const TYPE_STYLES = {
    in: 'border-green-900/50 bg-green-900/20 text-green-400',
    out: 'border-red-900/50 bg-red-900/20 text-red-400',
}

const getTypeStyle = (type) =>
    TYPE_STYLES[type] || 'border-slate-800 bg-slate-900/40 text-slate-400'

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const InventoryMovement = () => {
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    const [showRestockModal, setShowRestockModal] = useState(false)

    const { data: logsRes } = useQuery({
        queryKey: ['inventory-logs'],
        queryFn: () => $api('/inventory/logs'),
    })
    const logs = logsRes?.data || []

    const { data: inventoriesRes } = useQuery({
        queryKey: ['inventories'],
        queryFn: () => $api('/inventories'),
    })
    const inventories = inventoriesRes?.data || []

    const restockMutation = useMutation({
        mutationFn: (form) =>
            $api('/inventory/logs', {
                method: 'POST',
                body: JSON.stringify({
                    inventory_id: form.inventory_id,
                    type: 'in',
                    action: 'restock',
                    quantity: form.quantity,
                    notes: form.notes || null,
                }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-logs'] })
            queryClient.invalidateQueries({ queryKey: ['inventories'] })
        },
    })

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(logs.length / itemsPerPage)

    const counts = {
        total: logs.length,
        in: logs.filter((log) => log.type === 'in').length,
        out: logs.filter((log) => log.type === 'out').length,
    }

    const STAT_CARDS = [
        { key: 'total', label: 'Total Movements', value: counts.total, icon: History, accent: 'text-slate-300', ring: 'bg-slate-800/80 border-slate-700/50' },
        { key: 'in', label: 'Stock In', value: counts.in, icon: ArrowDownCircle, accent: 'text-green-400', ring: 'bg-green-500/10 border-green-500/20' },
        { key: 'out', label: 'Stock Out', value: counts.out, icon: ArrowUpCircle, accent: 'text-red-400', ring: 'bg-red-500/10 border-red-500/20' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg font-semibold tracking-tight text-white">Inventory Movements</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowRestockModal(true)}
                        className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <PackagePlus size={15} />
                        Restock
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
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

            {/* Table */}
            <div className="overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse min-w-[1050px]">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                            <th className="py-3.5 px-4 w-16">ID</th>
                            <th className="py-3.5 px-4">Item</th>
                            <th className="py-3.5 px-4">SKU</th>
                            <th className="py-3.5 px-4 text-center">Type</th>
                            <th className="py-3.5 px-4">Performed By</th>
                            <th className="py-3.5 px-4">Action</th>
                            <th className="py-3.5 px-4 text-right">Quantity</th>
                            <th className="py-3.5 px-4">Repair Job</th>
                            <th className="py-3.5 px-4">Notes</th>
                            <th className="py-3.5 px-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                        {currentLogs.length > 0 ? (
                            currentLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/20 group transition-colors duration-150">
                                    <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                        #{log.id}
                                    </td>

                                    <td className="p-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shrink-0">
                                                <Package size={13} />
                                            </span>
                                            <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                                {log.inventory?.item_name || '—'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className="font-mono text-xs uppercase bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-slate-300">
                                            {log.inventory?.sku || '—'}
                                        </span>
                                    </td>

                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getTypeStyle(log.type)}`}>
                                            {log.type === 'in' ? (
                                                <ArrowDownCircle size={11} />
                                            ) : (
                                                <ArrowUpCircle size={11} />
                                            )}
                                            {log.type}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5">
                                            <UserCircle size={13} className="text-slate-500 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="text-slate-200 truncate">
                                                    {log.logged_by?.name || '—'}
                                                </div>
                                                {log.logged_by?.role?.name && (
                                                    <div className="text-[9px] text-slate-500 capitalize">
                                                        {log.logged_by.role.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className="text-[10px] font-medium bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 capitalize">
                                            {log.action?.replace(/_/g, ' ')}
                                        </span>
                                    </td>

                                    <td className="p-4 text-right font-mono tabular-nums">
                                        <span className={log.type === 'in' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                            {log.type === 'in' ? '+' : '-'}{Number(log.quantity)} {log.inventory?.unit}
                                        </span>
                                    </td>

                                    <td className="p-4 font-mono text-slate-400">
                                        {log.repair_job_id ? `#${log.repair_job_id}` : '—'}
                                    </td>

                                    <td className="p-4 text-slate-400 max-w-[180px] truncate">
                                        {log.notes || '—'}
                                    </td>

                                    <td className="p-4 text-slate-400 text-nowrap">
                                        {formatDate(log.created_at)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="p-10 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <History size={20} className="text-slate-700" />
                                        <span className="italic text-xs">No inventory movements found.</span>
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
                totalItems={logs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

            <RestockModal
                isOpen={showRestockModal}
                onClose={() => setShowRestockModal(false)}
                onSubmit={(form) => restockMutation.mutateAsync(form)}
                inventories={inventories}
            />
        </motion.div>
    )
}

export default InventoryMovement