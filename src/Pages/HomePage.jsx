import { motion } from 'framer-motion'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import GuestLayout from '../Layouts/GuestLayout'

const HomePage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const sessionNotice = searchParams.get('session') === 'expired'
        ? 'Your web session ended because another administrator signed in, or your access expired.'
        : null

    // Layout Orchestration Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] } // Custom easeOutCubic
        }
    }

    const featureContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.4 }
        }
    }

    const features = [
        { title: 'Custom Body Building', desc: 'Premium metal fabrication, frame reinforcement, custom utility chassis building, and heavy detailing.', icon: '🛠️' },
        { title: 'Precision Paint Jobs', desc: 'State-of-the-art spray booths, rust protection treatments, and custom refinishing.', icon: '🎨' },
        // Added a 3rd tracking feature right into the list grid for higher visibility
        { title: 'Live Progress Tracking', desc: 'No smartphone app needed. Instantly track your repair using your custom reference number.', icon: '🔍' }
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col">
            {/* Color Base Overhaul: Consistent Emerald & Mint-Industrial Theme Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[140px] pointer-events-none" />

            <GuestLayout />

            {/* Hero section */}
            <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-16 md:py-20 relative z-10 w-full">
                {sessionNotice && (
                    <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        {sessionNotice}
                    </div>
                )}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center md:text-left max-w-3xl space-y-6"
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider"
                    >
                        <span>🇯🇵</span> Vehicle Customization & Servicing Hub
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-outfit"
                    >
                        Premium Body Building & <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent font-bold">
                            Expert Paint Refinishing
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-slate-400 md:text-lg max-w-2xl leading-relaxed"
                    >
                        Welcome to Japan Trading's custom workshop portal.
                        Manage vehicle fabrication pipelines, assign mechanics to repair orders, and coordinate vehicle detailing services.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
                        <button
                            onClick={() => navigate('/booking')}
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Book a Repair ➔
                        </button>
                        
                        {/* REPLACED "Learn More" with a clean Track Booking action */}
                        <button
                            onClick={() => navigate('/track')}
                            className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700/80 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Track Repair Status
                        </button>
                    </motion.div>
                </motion.div>

                {/* Feature Grid with Smooth Sequential Entrance */}
                <motion.div
                    variants={featureContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {features.map((feat) => (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -6, borderColor: 'rgba(16, 185, 129, 0.25)', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                            key={feat.title}
                            className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 transition-colors duration-300 flex flex-col gap-4 group cursor-default"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                                {feat.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                                    {feat.title}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {feat.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
                    <p>© 2026 Japan Trading Co., Ltd. All Rights Reserved. Workshop Dev console v1.0.0</p>
                </div>
            </footer>
        </div>
    )
}

export default HomePage