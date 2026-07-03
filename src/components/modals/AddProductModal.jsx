import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X } from 'lucide-react'

const inputClass =
    'w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50'

const labelClass = 'block text-xs text-slate-400 mb-1.5'

const AddProductModal = ({ isOpen, onClose, onSubmit, categories }) => {
    
    const [form, setForm] = useState({
        item_name: '',
        quantity_in_stock: '',
        unit: '',
        unit_price: '',
        min_stock_alert: '',
        category_id: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState(null)

    const resetAndClose = () => {
        setForm({ item_name: '', quantity_in_stock: '', unit: '', unit_price: '', min_stock_alert: '', category_id: '' })
        setFormError(null)
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError(null)
        try {
            await onSubmit(form)
            resetAndClose()
        } catch (error) {
            setFormError(error?.message || 'Failed to add product.')
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
                            <h2 className="text-base font-semibold text-white">Add Product</h2>
                            <button onClick={resetAndClose} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className={labelClass}>Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.item_name}
                                    onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                                    className={inputClass}
                                    placeholder="e.g. Deep Blue Paint"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Category</label>
                                <select
                                    required
                                    value={form.category_id}
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={form.quantity_in_stock}
                                        onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                                        className={inputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Unit</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.unit}
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        className={inputClass}
                                        placeholder="liter, pcs, kg..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Unit Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={form.unit_price}
                                        onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                                        className={inputClass}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Min Stock Alert</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.min_stock_alert}
                                        onChange={(e) => setForm({ ...form, min_stock_alert: e.target.value })}
                                        className={inputClass}
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <p className="text-[11px] text-red-400">{formError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
                            >
                                {submitting ? 'Adding...' : 'Add Product'}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default AddProductModal