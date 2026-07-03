import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { $api } from '../api/client'

const LoginPage = () => {
    const navigate = useNavigate()
    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    })
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            // cleanly matches your Laravel endpoints setup
            const res = await $api('/login', {
                method: 'POST',
                body: formData,
            })

            const { access_token, user } = res

            // Save essential session items straight to localStorage
            localStorage.setItem('accessToken', access_token)
            localStorage.setItem('userData', JSON.stringify(user))

            // Redirect smoothly to your dashboard layout
            navigate('/dashboard')
        } 
        catch (error) {
            // ofetch cleanly exposes the backend validation structure here
            if (error.status === 422) {
                setErrors(error._data?.errors || {})
            } else if (error.status === 401 || error.status === 403) {
                setErrors({ email: [error._data?.message || 'Invalid credentials'] })
            } else {
                setErrors({ email: ['An unexpected error occurred. Please try again.'] })
            }
        } 
        finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleLogin} className="w-full max-w-lg mx-auto flex flex-col gap-6">
            {/* Email Field */}
            <div className="flex flex-col gap-2.5">
                <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-slate-950/40 border border-slate-800 text-slate-100 rounded-md px-6 py-5 text-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                    placeholder="name@company.com"
                />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="password"
                        className="block text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                        Password
                    </label>
                    <a
                        href="#"
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors tracking-wide"
                    >
                        Forgot password?
                    </a>
                </div>
                <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full bg-slate-950/40 border border-slate-800 text-slate-100 rounded-md px-6 py-5 text-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="••••••••"
                />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
                <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer select-none group">
                    <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 accent-indigo-500 cursor-pointer"
                    />
                    <span className="group-hover:text-slate-300 transition-colors text-sm font-medium">
                        Remember this account
                    </span>
                </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold py-5 rounded-md shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-3 text-lg cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Signing in...</span>
                        </>
                    ) : (
                        'Sign In'
                    )}
                </motion.button>
            </div>
        </form>
    )
}

export default LoginPage