import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import companyLogo from '../assets/Images/company-logo.png.png'
import LoginPage from '../Pages/LoginPage'

const GuestLayout = () => {
    const [loginOpen, setLoginOpen] = useState(false)
    const navigate = useNavigate()

    return (
        <>
            {/* Navbar Header */}
            <header className="h-20 border-b border-slate-900 bg-slate-950 backdrop-blur-md sticky top-0 z-50 flex items-center justify-center">
                <div className="w-full max-w-7xl px-8 md:px-16 lg:px-24 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            onClick={() => navigate('/')}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20 p-2 hover:cursor-pointer">
                            <img
                                src={companyLogo}
                                alt="Japan Trading Logo"
                                className="h-full w-auto object-contain brightness-110 contrast-125"
                            />
                        </div>
                        <span
                            onClick={() => navigate('/')}
                            className="text-xl font-bold tracking-tight text-white font-outfit hover:text-emerald-400 transition-colors duration-200 cursor-pointer">Japan Trading</span>
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
        </>
    )
}

export default GuestLayout
