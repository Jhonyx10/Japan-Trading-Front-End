import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Loader2 } from 'lucide-react'
import { getUserData, logout } from '../../utils/auth'

const ProfilePage = () => {
    const navigate = useNavigate()
    const user = getUserData()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        if (isLoggingOut) return

        setIsLoggingOut(true)
        try {
            await logout()
        } finally {
            setIsLoggingOut(false)
            navigate('/', { replace: true })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 max-w-2xl mx-auto space-y-6"
        >
            <div className="border-b border-slate-800/60 pb-4">
                <h2 className="text-xl font-bold text-white">Profile</h2>
                <p className="text-xs text-slate-400 mt-1">Your account details and session settings.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Display Name</label>
                        <input
                            type="text"
                            readOnly
                            value={user?.name || '—'}
                            className="w-full bg-slate-950 border border-slate-800/80 text-slate-350 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Role</label>
                        <input
                            type="text"
                            readOnly
                            value={user?.role?.name || user?.role || '—'}
                            className="w-full bg-slate-950 border border-slate-800/80 text-slate-350 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email</label>
                    <input
                        type="text"
                        readOnly
                        value={user?.email || '—'}
                        className="w-full bg-slate-950 border border-slate-800/80 text-slate-350 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="border-t border-slate-800/60 pt-6">
                <h3 className="text-sm font-semibold text-white mb-1">Session</h3>
                <p className="text-xs text-slate-500 mb-4">Sign out of this device and revoke your access token.</p>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <LogOut size={16} />
                    )}
                    {isLoggingOut ? 'Signing out...' : 'Logout'}
                </button>
            </div>
        </motion.div>
    )
}

export default ProfilePage
