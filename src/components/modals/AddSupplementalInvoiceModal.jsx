import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { PlusCircle, X } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'

const inputClass =
    'w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 disabled:opacity-50'

const labelClass = 'block text-xs text-slate-400 mb-1.5'

const AddSupplementalInvoiceModal = ({ isOpen, onClose, onSubmit, parentInvoice }) => {
    const [form, setForm] = useState({
        labor_cost: '',
        material_cost: '',
        tax: '',
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState(null)

    const totalPreview = useMemo(() => {
        const labor = Number(form.labor_cost) || 0
        const material = Number(form.material_cost) || 0
        const tax = Number(form.tax) || 0
        return labor + material + tax
    }, [form.labor_cost, form.material_cost, form.tax])

    const resetAndClose = () => {
        setForm({ labor_cost: '', material_cost: '', tax: '', notes: '' })
        setFormError(null)
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError(null)
        try {
            await onSubmit({
                parent_id: parentInvoice.id,
                labor_cost: Number(form.labor_cost),
                material_cost: Number(form.material_cost) || 0,
                tax: Number(form.tax) || 0,
                notes: form.notes.trim() || null,
            })
            resetAndClose()
        } catch (error) {
            const backendErrors = error?._data?.errors
            if (backendErrors) {
                const first = Object.values(backendErrors)[0]
                setFormError(Array.isArray(first) ? first[0] : first)
            } else {
                setFormError(error?.message || 'Failed to create additional invoice.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={resetAndClose}
                        className="absolute inset-0 bg-slate-950/85"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
                    >
                        <div className="flex items-center gap-4 px-6 pt-6 pb-5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                                <PlusCircle size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-semibold text-white">
                                    Add Additional Work Invoice
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500 truncate">
                                    Linked to {parentInvoice?.invoice_number}
                                </p>
                            </div>
                            <button
                                onClick={resetAndClose}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="h-px bg-slate-800" />

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 px-6 py-5">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Use this when workers discover extra repair work that was not
                                    included in the customer&apos;s original services.
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Labor Cost *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                            disabled={submitting}
                                            value={form.labor_cost}
                                            onChange={(e) =>
                                                setForm({ ...form, labor_cost: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Material Cost</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            disabled={submitting}
                                            value={form.material_cost}
                                            onChange={(e) =>
                                                setForm({ ...form, material_cost: e.target.value })
                                            }
                                            className={inputClass}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Tax</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        disabled={submitting}
                                        value={form.tax}
                                        onChange={(e) => setForm({ ...form, tax: e.target.value })}
                                        className={inputClass}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3 flex justify-between items-center">
                                    <span className="text-xs text-slate-400">Estimated total</span>
                                    <span className="text-sm font-semibold text-sky-400 font-mono">
                                        {formatCurrency(totalPreview)}
                                    </span>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Notes <span className="text-slate-600">(describe the additional work)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        disabled={submitting}
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        className={`${inputClass} resize-none`}
                                        placeholder="e.g. Discovered rust on rear panel requiring extra body work..."
                                    />
                                </div>

                                {formError && (
                                    <p className="text-[11px] text-red-400">{formError}</p>
                                )}
                            </div>

                            <div className="h-px bg-slate-800" />

                            <div className="flex justify-end gap-2 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={resetAndClose}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || totalPreview <= 0}
                                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? 'Creating...' : 'Create Invoice'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default AddSupplementalInvoiceModal
