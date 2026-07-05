import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { $api } from '../../api/client'

const AddWorkerModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'worker',
        worker_type_id: '',
    })

    // 1. Fetch available worker types for the drop-down menu
    const { data: roles = [], isLoading: rolesLoading } = useQuery({
        queryKey: ['worker-types'],
        queryFn: () => $api('/worker-types'),
        enabled: isOpen, // Only fetch when the modal opens
    })

    // 2. Setup the mutation to create a new worker
    const { mutate, isPending, error } = useMutation({
        mutationFn: (newWorkerData) =>
            $api('/users', {
                method: 'POST',
                body: newWorkerData,
            }),
        onSuccess: () => {
            // Automatically refresh the workers list view everywhere on the dashboard
            queryClient.invalidateQueries({ queryKey: ['workers'] })
            setFormData({ name: '', email: '', worker_type_id: '' })
            onClose()
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        mutate(formData)
    }

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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-semibold text-white">Add New Worker</h2>
                                <p className="mt-0.5 text-xs text-slate-500">Onboard a member to your crew registry</p>
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
                                {/* Name Input */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isPending}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Alex Mercer"
                                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
                                    />
                                    {backendErrors.name && (
                                        <p className="mt-1.5 text-xs text-rose-400">{backendErrors.name[0] || backendErrors.name}</p>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        disabled={isPending}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="alex@company.com"
                                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
                                    />
                                    {backendErrors.email && (
                                        <p className="mt-1.5 text-xs text-rose-400">{backendErrors.email[0] || backendErrors.email}</p>
                                    )}
                                </div>

                                  <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
                                    <input
                                        type="password"
                                        required
                                        disabled={isPending}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="*******"
                                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
                                    />
                                    {backendErrors.password && (
                                        <p className="mt-1.5 text-xs text-rose-400">{backendErrors.password[0] || backendErrors.password}</p>
                                    )}
                                </div>

                                {/* Assigned Worker Type Select */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Assigned Role Type</label>
                                    <div className="relative">
                                        <select
                                            required
                                            disabled={isPending || rolesLoading}
                                            value={formData.worker_type_id}
                                            onChange={(e) => setFormData({ ...formData, worker_type_id: e.target.value })}
                                            className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
                                        >
                                            <option value="" disabled>
                                                {rolesLoading ? 'Loading structural roles...' : 'Select a role classification'}
                                            </option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                        <svg
                                            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    {backendErrors.worker_type_id && (
                                        <p className="mt-1.5 text-xs text-rose-400">{backendErrors.worker_type_id[0] || backendErrors.worker_type_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-slate-800" />

                            {/* Footer Options */}
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
                                    disabled={isPending}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending ? 'Adding Worker...' : 'Onboard Worker'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default AddWorkerModal