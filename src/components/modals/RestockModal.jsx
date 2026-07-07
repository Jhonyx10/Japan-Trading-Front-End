import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'

const inputClass =
    'w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50'

const labelClass = 'block text-xs text-slate-400 mb-1.5'

const RestockModal = ({ isOpen, onClose, onSubmit, inventories, onSubmitApi }) => {
    const [form, setForm] = useState({
        inventory_id: '',
        quantity: '',
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState(null)

    const [categories, setCategories] = useState([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [categoryFilter, setCategoryFilter] = useState('')

    // Fetch item categories whenever the modal opens, same pattern used
    // elsewhere for /categories — response is wrapped as { data: [...] }.
    useEffect(() => {
        if (!isOpen) return

        let isActive = true

        const fetchCategories = async () => {
            setCategoriesLoading(true)
            try {
                const res = await onSubmitApi('/categories')
                if (isActive) setCategories(res.data ?? [])
            } catch (error) {
                if (isActive) setCategories([])
            } finally {
                if (isActive) setCategoriesLoading(false)
            }
        }
        fetchCategories()

        return () => {
            isActive = false
        }
    }, [isOpen, onSubmitApi])

    // Items narrowed down to the selected category, if one is chosen.
    const filteredInventories = useMemo(() => {
        if (!categoryFilter) return inventories
        return inventories.filter(
            (item) => String(item.category_id) === String(categoryFilter)
        )
    }, [inventories, categoryFilter])

    const resetAndClose = () => {
        setForm({ inventory_id: '', quantity: '', notes: '' })
        setFormError(null)
        setCategoryFilter('')
        onClose()
    }

    const handleCategoryFilterChange = (value) => {
        setCategoryFilter(value)
        // Clear the selected item if it no longer belongs to the newly chosen category.
        setForm((prev) => {
            const stillValid = inventories.some(
                (item) =>
                    String(item.id) === String(prev.inventory_id) &&
                    (!value || String(item.category_id) === String(value))
            )
            return stillValid ? prev : { ...prev, inventory_id: '' }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError(null)
        try {
            await onSubmit(form)
            resetAndClose()
        } catch (error) {
            setFormError(error?.message || 'Failed to restock item.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={resetAndClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-white">Restock Item</h2>
                            <button onClick={resetAndClose} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className={labelClass}>Filter by category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => handleCategoryFilterChange(e.target.value)}
                                    disabled={categoriesLoading}
                                    className={`${inputClass} disabled:opacity-50`}
                                >
                                    <option value="">
                                        {categoriesLoading ? 'Loading categories...' : 'All categories'}
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Item</label>
                                <select
                                    required
                                    value={form.inventory_id}
                                    onChange={(e) => setForm({ ...form, inventory_id: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">
                                        {filteredInventories.length === 0
                                            ? 'No items in this category'
                                            : 'Select item'}
                                    </option>
                                    {filteredInventories.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.item_name} ({item.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Quantity to Add</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                    className={inputClass}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Notes (optional)</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className={inputClass}
                                    rows={2}
                                    placeholder="e.g. Supplier delivery"
                                />
                            </div>

                            {formError && (
                                <p className="text-[11px] text-red-400">{formError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
                            >
                                {submitting ? 'Restocking...' : 'Restock'}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default RestockModal
