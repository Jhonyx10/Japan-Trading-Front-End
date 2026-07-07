import { motion } from 'framer-motion'
import { $api } from '../../../api/client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, AlertTriangle, Boxes, Tag, Plus, FolderPlus } from 'lucide-react'
import AddProductModal from '../../../components/modals/AddProductModal'
import AddItemCategoryModal from '../../../components/modals/AddItemCategoryModal'
import Pagination from '../../../components/Pagination'
import { formatCurrency } from '../../../utils/currency'

const Stocks = () => {
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [showAddProductModal, setShowAddProductModal] = useState(false)
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
    const itemsPerPage = 5

    const { data: inventoriesRes, isLoading } = useQuery({
        queryKey: ['inventories'],
        queryFn: () => $api('/inventories'),
    })
    const inventories = inventoriesRes?.data || []

    const { data: categoriesRes } = useQuery({
        queryKey: ['categories'],
        queryFn: () => $api('/categories'),
    })
    const categories = categoriesRes?.data || []

    const addProductMutation = useMutation({
        mutationFn: (form) =>
            $api('/inventories', {
                method: 'POST',
                body: form,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventories'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-logs'] })
        },
    })

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = inventories.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(inventories.length / itemsPerPage)

    const isLowStock = (item) =>
        Number(item.quantity_in_stock) <= Number(item.min_stock_alert)

    const totals = {
        total: inventories.length,
        lowStock: inventories.filter(isLowStock).length,
        totalValue: inventories.reduce(
            (sum, item) => sum + Number(item.quantity_in_stock) * Number(item.unit_price),
            0
        ),
    }

    const STAT_CARDS = [
        { key: 'total', label: 'Total Items', value: totals.total, icon: Boxes, accent: 'text-slate-300', ring: 'bg-slate-800/80 border-slate-700/50' },
        { key: 'lowStock', label: 'Low Stock', value: totals.lowStock, icon: AlertTriangle, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
        { key: 'totalValue', label: 'Total Stock Value', value: formatCurrency(totals.totalValue), icon: Package, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg font-semibold tracking-tight text-white">Stocks</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddCategoryModal(true)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <FolderPlus size={15} />
                        Add Category
                    </button>
                    <button
                        onClick={() => setShowAddProductModal(true)}
                        className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <Plus size={15} />
                        Add Product
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
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                            <th className="py-3.5 px-4 w-16">ID</th>
                            <th className="py-3.5 px-4">Item Name</th>
                            <th className="py-3.5 px-4">SKU</th>
                            <th className="py-3.5 px-4">Category</th>
                            <th className="py-3.5 px-4 text-right">Qty in Stock</th>
                            <th className="py-3.5 px-4">Unit</th>
                            <th className="py-3.5 px-4 text-right">Unit Price</th>
                            <th className="py-3.5 px-4 text-center w-28">Stock Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="p-10 text-center">
                                    <span className="text-slate-500 italic text-xs">Loading inventory...</span>
                                </td>
                            </tr>
                        ) : currentItems.length > 0 ? (
                            currentItems.map((item) => {
                                const lowStock = isLowStock(item)
                                return (
                                    <tr key={item.id} className="hover:bg-slate-800/20 group transition-colors duration-150">
                                        <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                            #{item.id}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shrink-0">
                                                    <Package size={13} />
                                                </span>
                                                <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                                    {item.item_name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span className="font-mono text-xs uppercase bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-slate-300">
                                                {item.sku}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                                                <Tag size={10} />
                                                {item.category?.name || '—'}
                                            </span>
                                        </td>

                                        <td className="p-4 text-right font-mono tabular-nums">
                                            <span className={lowStock ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                                                {Number(item.quantity_in_stock)}
                                            </span>
                                        </td>

                                        <td className="p-4 text-slate-400 capitalize">
                                            {item.unit}
                                        </td>

                                        <td className="p-4 text-right font-semibold text-slate-200 font-mono tabular-nums">
                                            {formatCurrency(item.unit_price)}
                                        </td>

                                        <td className="p-4 text-center">
                                            {lowStock ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-amber-900/50 bg-amber-900/20 text-amber-400">
                                                    <AlertTriangle size={10} className="mr-1" />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-green-900/50 bg-green-900/20 text-green-400">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="p-10 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <Package size={20} className="text-slate-700" />
                                        <span className="italic text-xs">No inventory items found.</span>
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
                totalItems={inventories.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

            <AddProductModal
                isOpen={showAddProductModal}
                onClose={() => setShowAddProductModal(false)}
                onSubmit={(form) => addProductMutation.mutateAsync(form)}
                categories={categories}
            />

            <AddItemCategoryModal
                isOpen={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
            />
        </motion.div>
    )
}

export default Stocks
