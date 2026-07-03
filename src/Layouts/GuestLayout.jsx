import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

const GuestLayout = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Decorative gradient background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    {/* Logo mockup */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
                        <span className="text-xl font-bold text-white">JT</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white font-outfit">Japan Trading</h2>
                    <p className="text-sm text-slate-400 mt-1">International Trade Portal</p>
                </div>

                <Outlet />
            </motion.div>
        </div>
    )
}

export default GuestLayout
