import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const AddServiceModal = ({ isOpen, onClose, onServiceCreated, onSubmitApi }) => {
    const [formData, setFormData] = useState({
        name: '',
        worker_type: '',
        base_price: '',
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [roles, setRoles] = useState([])
    const [rolesLoading, setRolesLoading] = useState(true)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            const res = await onSubmitApi('/services', {
                method: 'POST',
                body: formData,
            })
            onServiceCreated(res)
            setFormData({ name: '', worker_type: '', base_price: '' })
            onClose()
        } catch (error) {
            setErrors(error._data?.errors || {})
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isOpen) return

        const fetchRoles = async () => {
            setRolesLoading(true)
            try {
                const res = await onSubmitApi('/roles')
                setRoles(res)
            } catch (error) {
                setRoles([])
            } finally {
                setRolesLoading(false)
            }
        }
        fetchRoles()
    }, [isOpen])

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

                    {/* Modal */}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-semibold text-white">Add Service</h2>
                                <p className="mt-0.5 text-xs text-slate-500">Create a new entry for your service catalog</p>
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
                                        Service name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Oil Change"
                                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500"
                                    />
                                    {errors.name && (
                                        <p className="mt-1.5 text-xs text-rose-400">{errors.name[0] || errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                                        Assigned role
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.worker_type}
                                            onChange={(e) => setFormData({ ...formData, worker_type: e.target.value })}
                                            disabled={rolesLoading}
                                            className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
                                        >
                                            <option value="" disabled>
                                                {rolesLoading ? 'Loading roles...' : 'Select a role'}
                                            </option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
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
                                    {errors.role_id && (
                                        <p className="mt-1.5 text-xs text-rose-400">{errors.role_id[0] || errors.role_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                                        Base price
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.base_price}
                                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-7 pr-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500"
                                        />
                                    </div>
                                    {errors.base_price && (
                                        <p className="mt-1.5 text-xs text-rose-400">{errors.base_price[0] || errors.base_price}</p>
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
                                    disabled={loading}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'Saving...' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default AddServiceModal