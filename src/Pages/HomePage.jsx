import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import companyLogo from '../assets/Images/company-logo.png.png'
import LoginPage from './LoginPage'

const HomePage = () => {
    const [loginOpen, setLoginOpen] = useState(false)
    const [searchParams] = useSearchParams()
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
        { title: 'Worker Assignment Hub', desc: 'Seamless dispatch logistics to map expert mechanics and custom fabricators to repair lines.', icon: '👥' }
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col">
            {/* Color Base Overhaul: Consistent Emerald & Mint-Industrial Theme Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[140px] pointer-events-none" />

            {/* Navbar Header */}
            <header className="h-20 border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 flex items-center justify-center">
                <div className="w-full max-w-7xl px-8 md:px-16 lg:px-24 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20 p-2">
                            <img
                                src={companyLogo}
                                alt="Japan Trading Logo"
                                className="h-full w-auto object-contain brightness-110 contrast-125"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white font-outfit">Japan Trading</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#" className="hover:text-emerald-400 transition-colors duration-200">Services</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors duration-200">Workshop</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors duration-200">Gallery</a>
                        <Link to="/about" className="hover:text-emerald-400 transition-colors duration-200">About App</Link>
                    </nav>

                    <div>
                        <button
                            onClick={() => setLoginOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 font-semibold px-5 py-2 rounded-xl text-slate-200 text-sm transition-all duration-200 inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            <span>🔑</span> Sign In
                        </button>
                    </div>
                </div>
            </header>

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
                            onClick={() => setLoginOpen(true)}
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Start Dashboard Session ➔
                        </button>
                        <Link
                            to="/about"
                            className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700/80 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Learn More
                        </Link>
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

            {/* Slide-over Login Drawer */}
            <AnimatePresence>
                {loginOpen && (
                    <>
                        {/* Blur Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLoginOpen(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 cursor-pointer"
                        />

                        {/* Drawer panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-slate-900 bg-slate-950 px-6 sm:px-10 py-12 shadow-2xl font-sans"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setLoginOpen(false)}
                                className="absolute top-6 right-6 rounded-lg bg-slate-900 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer z-10 border border-slate-800"
                            >
                                ✕
                            </button>

                            {/* Main Drawer Container Centered Layout */}
                            <div className="flex-1 flex flex-col justify-center items-center w-full">
                                <div className="w-full max-w-sm space-y-8 py-4">
                                    {/* Logo & Headline Block matching Theme */}
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/10 p-2">
                                            <img
                                                src={companyLogo}
                                                alt="Japan Trading Logo"
                                                className="h-full w-auto object-contain brightness-110"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-extrabold tracking-tight text-white">Japan Trading</h2>
                                            <p className="text-sm text-emerald-400/80 font-medium mt-1">Workshop Portal</p>
                                        </div>
                                    </div>

                                    {/* Render Sub-component Login Form */}
                                    <LoginPage />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default HomePage