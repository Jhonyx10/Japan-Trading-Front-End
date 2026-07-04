import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { $api } from '../../api/client'

const AddWorkerTypeModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('')
    const queryClient = useQueryClient()

    // Mutation setup using TanStack Query and your custom $api
    const { mutate, isPending, error } = useMutation({
        mutationFn: (newTypeName) =>
            $api('/create/worker-type', {
                method: 'POST',
                body: { name: newTypeName.trim().toLowerCase() },
            }),
        onSuccess: () => {
            // Automatically refetch worker-types everywhere on your site
            queryClient.invalidateQueries({ queryKey: ['worker-types'] })
            queryClient.invalidateQueries({ queryKey: ['services'] })
            setName('')
            onClose()
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name.trim()) return
        mutate(name)
    }

    // Safely extract validation messages out of query error object matching your framework structure
    const backendErrors = error?._data?.errors || {}

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/85"
                    />

                    {/* Modal Wrapper */}
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-4 px-6 pt-6 pb-5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-semibold text-white">Add Worker Type</h2>
                                <p className="mt-0.5 text-xs text-slate-500">Create a new organizational role category</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 cursor-pointer"
                                aria-label="Close modal"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="h-px bg-slate-800" />

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 px-6 py-5">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                                        Type Identifier / Role Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isPending}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., painter, body_builder"
                                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
                                    />
                                    {backendErrors.name && (
                                        <p className="mt-1.5 text-xs text-rose-400">
                                            {backendErrors.name[0] || backendErrors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-slate-800" />

                            {/* Footer */}
                            <div className="flex justify-end gap-2 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || !name.trim()}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending ? 'Creating...' : 'Save Type'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default AddWorkerTypeModal