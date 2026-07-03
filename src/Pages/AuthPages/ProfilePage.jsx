import { motion } from 'framer-motion'

const ProfilePage = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 max-w-2xl mx-auto space-y-6"
        >
            <div className="border-b border-slate-800/60 pb-4">
                <h2 className="text-xl font-bold text-white">Security Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Manage your professional credentials and account configuration.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Display Name</label>
                        <input
                            type="text"
                            readOnly
                            value="Admin User"
                            className="w-full bg-slate-950 border border-slate-800/80 text-slate-350 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Role Status</label>
                        <input
                            type="text"
                            readOnly
                            value="Administrator"
                            className="w-full bg-slate-950 border border-slate-800/80 text-slate-350 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Company Domain</label>
                    <input
                        type="text"
                        readOnly
                        value="japan-trading-logistics.com"
                        className="w-full bg-slate-950 border border-slate-800/80 text-slate-350 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default ProfilePage
