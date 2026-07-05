import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tag, X } from 'lucide-react'
import { $api } from '../../api/client'

const inputClass =
    'w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-sky-500 disabled:opacity-50'

const AddItemCategoryModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ name: '', description: '' })
    const queryClient = useQueryClient()

    const { mutate, isPending, error } = useMutation({
        mutationFn: (payload) =>
            $api('/categories', {
                method: 'POST',
                body: payload,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            setForm({ name: '', description: '' })
            onClose()
        },
    })

    const backendErrors = error?._data?.errors || {}

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.name.trim()) return
        mutate({
            name: form.name.trim(),
            description: form.description.trim() || null,
        })
    }

    const handleClose = () => {
        setForm({ name: '', description: '' })
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-950/85"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
                    >
                        <div className="flex items-center gap-4 px-6 pt-6 pb-5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                                <Tag size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-semibold text-white">Add Item Category</h2>
                                <p className="mt-0.5 text-xs text-slate-500">Group inventory items by category</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="h-px bg-slate-800" />

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 px-6 py-5">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isPending}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Paint, Tools, Parts"
                                        className={inputClass}
                                    />
                                    {backendErrors.name && (
                                        <p className="mt-1.5 text-xs text-rose-400">
                                            {backendErrors.name[0] || backendErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                                        Description <span className="text-slate-600">(optional)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        disabled={isPending}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Brief description of this category..."
                                        className={`${inputClass} resize-none`}
                                    />
                                    {backendErrors.description && (
                                        <p className="mt-1.5 text-xs text-rose-400">
                                            {backendErrors.description[0] || backendErrors.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-slate-800" />

                            <div className="flex justify-end gap-2 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || !form.name.trim()}
                                    className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending ? 'Creating...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default AddItemCategoryModal
