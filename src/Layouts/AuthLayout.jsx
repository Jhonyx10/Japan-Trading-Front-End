import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
    LayoutDashboard,
    UserCircle,
    Car,
    Settings,
    Users,
    Wrench,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronDown,
    Toolbox,
    CheckSquare,
    UserCheck,
    History,
    FileText,
    CreditCard,
    LucideHistory,
    Package,
} from 'lucide-react'
import companyLogo from '../assets/Images/company-logo.png.png'

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
]

const manageSubItems = [
    { name: 'Workers', path: '/manage/workers', icon: Users },
    { name: 'Services', path: '/manage/services', icon: CheckSquare },
]

const repairJobsSubItems = [
    { name: 'Repair Requests', path: '/repair/requests', icon: Toolbox },
    { name: 'Assigned Jobs', path: '/repair/assigned', icon: UserCheck },
    { name: 'Repair History', path: '/repair/history', icon: History },
]

const invoicesSubItems = [
    { name: 'Contracts', path: '/invoices/contracts', icon: FileText },
    { name: 'Payments', path: '/invoices/payments', icon: CreditCard },
    { name: 'Transactions', path: '/invoices/transactions', icon: LucideHistory },
]

const inventorySubItems = [
    { name: 'Stocks', path: '/inventory/stocks', icon: Package },
    { name: 'Item Movements', path: '/inventory/movements', icon: CreditCard },
]

const AuthLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [manageOpen, setManageOpen] = useState(false)
    const [repairJobsOpen, setRepairJobsOpen] = useState(false)
    const [invoicesOpen, setInvoicesOpen] = useState(false)
    const [inventoryOpen, setInventoryOpen] = useState(false)
    const userMenuRef = useRef(null)
    const [user, setUser] = useState({
        name: 'Admin User',
        email: 'administrator@japantrading.com',
        role: { name: 'Admin' },
    })

    const isManageActive = location.pathname.startsWith('/manage')
    const isRepairJobsActive = location.pathname.startsWith('/repair')
    const isinvoicesActive = location.pathname.startsWith('/invoices')
    const isInventoryActive = location.pathname.startsWith('/inventory')

    // Automatically toggle dropdowns based on current route context 
    // and close non-active dropdown categories
    useEffect(() => {
        if (isManageActive) {
            setManageOpen(true)
            setRepairJobsOpen(false)
            setInvoicesOpen(false)
        } else if (isRepairJobsActive) {
            setRepairJobsOpen(true)
            setManageOpen(false)
            setInvoicesOpen(false)
        } else if (isinvoicesActive) {
            setInvoicesOpen(true)
            setManageOpen(false)
            setRepairJobsOpen(false)
        } else if (isInventoryActive) {
            setInventoryOpen(true)
            setManageOpen(false)
            setRepairJobsOpen(false)
            setInvoicesOpen(false)
        } else {
            // Closes all submenus when navigating back to top-level routes like /dashboard or /vehicles
            setManageOpen(false)
            setRepairJobsOpen(false)
            setInvoicesOpen(false)
            setInventoryOpen(false)
        }
    }, [location.pathname, isManageActive, isRepairJobsActive, isinvoicesActive, isInventoryActive])

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('userData')
            if (savedUser) {
                setUser(JSON.parse(savedUser))
            }
        } catch (e) {
            console.error('Failed to parse user data', e)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false)
            }
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setUserMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userData')
        setUserMenuOpen(false)
        navigate('/login')
    }

    const handleProfileNavigate = () => {
        setUserMenuOpen(false)
        navigate('/profile')
    }

    // Dynamic Active Page Title Finder
    const getActivePageName = () => {
        const directMatch = menuItems.find((item) => location.pathname === item.path)
        if (directMatch) return directMatch.name

        const manageMatch = manageSubItems.find((item) => location.pathname === item.path)
        if (manageMatch) return manageMatch.name

        const repairMatch = repairJobsSubItems.find((item) => location.pathname === item.path)
        if (repairMatch) return repairMatch.name

        const invoicesMatch = invoicesSubItems.find((item) => location.pathname === item.path)
        if (invoicesMatch) return invoicesMatch.name

        const inventoryMatch = inventorySubItems.find((item) => location.pathname === item.path)
        if (inventoryMatch) return inventoryMatch.name

        return isManageActive ? 'Manage' : isRepairJobsActive ? 'Repair Jobs' : isinvoicesActive ? 'Invoices' : isInventoryActive ? 'Inventory' : 'Console'
    }

    const activePage = getActivePageName()
    const userInitial = user?.role?.name?.charAt(0).toUpperCase() || 'U'

    return (
        <div className="flex min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
            <motion.aside
                animate={{ width: sidebarOpen ? 200 : 88 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="relative z-20 flex shrink-0 flex-col border-r border-slate-800/80 bg-slate-900"
            >
                {/* Brand */}
                <div className="flex h-[72px] items-center justify-between border-b border-slate-800/80 px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-white to-violet-500 p-2 shadow-lg shadow-indigo-500/20">
                            <img
                                src={companyLogo}
                                alt="Japan Trading Logo"
                                className="h-full w-auto object-contain brightness-105"
                            />
                        </div>
                        <AnimatePresence mode="wait">
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="min-w-0"
                                >
                                    <p className="truncate text-sm font-bold tracking-wide text-white">
                                        Japan Trading
                                    </p>
                                    <p className="truncate text-xs text-slate-500">Workshop Console</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
                    <AnimatePresence mode="wait">
                        {sidebarOpen && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                            >
                                Menu
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {menuItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={!sidebarOpen ? item.name : undefined}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                isActive ? 'bg-white/10' : 'bg-slate-950/30'
                                            }`}
                                        >
                                            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                                        </span>
                                        <AnimatePresence mode="wait">
                                            {sidebarOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -6 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -6 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="truncate"
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </NavLink>
                        )
                    })}

                    {/* Manage dropdown */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setManageOpen((open) => !open)}
                            title={!sidebarOpen ? 'Manage' : undefined}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                                isManageActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                            }`}
                        >
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                    isManageActive ? 'bg-white/10' : 'bg-slate-950/30'
                                }`}
                            >
                                <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
                            </span>

                            <AnimatePresence mode="wait">
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="truncate"
                                    >
                                        Manage
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {sidebarOpen && (
                                <ChevronDown
                                    className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
                                        manageOpen ? 'rotate-180' : ''
                                    }`}
                                    strokeWidth={2}
                                />
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {manageOpen && sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-slate-800 pl-5">
                                        {manageSubItems.map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <NavLink
                                                    key={item.path}
                                                    to={item.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                            isActive
                                                                ? 'bg-slate-800 text-white'
                                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                                                        }`
                                                    }
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    <span className="truncate">{item.name}</span>
                                                </NavLink>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Repair Jobs Dropdown */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setRepairJobsOpen((open) => !open)}
                            title={!sidebarOpen ? 'Repair Jobs' : undefined}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                                isRepairJobsActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                            }`}
                        >
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                    isRepairJobsActive ? 'bg-white/10' : 'bg-slate-950/30'
                                }`}
                            >
                                <Wrench className="h-[18px] w-[18px]" strokeWidth={2} />
                            </span>

                            <AnimatePresence mode="wait">
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="truncate"
                                    >
                                        Repair Jobs
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {sidebarOpen && (
                                <ChevronDown
                                    className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
                                        repairJobsOpen ? 'rotate-180' : ''
                                    }`}
                                    strokeWidth={2}
                                />
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {repairJobsOpen && sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-slate-800 pl-5">
                                        {repairJobsSubItems.map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <NavLink
                                                    key={item.path}
                                                    to={item.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                            isActive
                                                                ? 'bg-slate-800 text-white'
                                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                                                        }`
                                                    }
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    <span className="truncate">{item.name}</span>
                                                </NavLink>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Invoices Dropdown */}
                              <div>
                        <button
                            type="button"
                            onClick={() => setInvoicesOpen((open) => !open)}
                            title={!sidebarOpen ? 'Invoices' : undefined}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                                isinvoicesActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                            }`}
                        >
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                    isinvoicesActive ? 'bg-white/10' : 'bg-slate-950/30'
                                }`}
                            >
                                <CreditCard className="h-[18px] w-[18px]" strokeWidth={2} />
                            </span>

                            <AnimatePresence mode="wait">
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="truncate"
                                    >
                                        Invoices
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {sidebarOpen && (
                                <ChevronDown
                                    className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
                                        invoicesOpen ? 'rotate-180' : ''
                                    }`}
                                    strokeWidth={2}
                                />
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {invoicesOpen && sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-slate-800 pl-5">
                                        {invoicesSubItems.map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <NavLink
                                                    key={item.path}
                                                    to={item.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                            isActive
                                                                ? 'bg-slate-800 text-white'
                                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                                                        }`
                                                    }
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    <span className="truncate">{item.name}</span>
                                                </NavLink>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                       <div>
                        <button
                            type="button"
                            onClick={() => setInventoryOpen((open) => !open)}
                            title={!sidebarOpen ? 'Inventory' : undefined}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                                inventoryOpen
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                            }`}
                        >
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                    inventoryOpen ? 'bg-white/10' : 'bg-slate-950/30'
                                }`}
                            >
                                <Wrench className="h-[18px] w-[18px]" strokeWidth={2} />
                            </span>

                            <AnimatePresence mode="wait">
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="truncate"
                                    >
                                        Inventory
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {sidebarOpen && (
                                <ChevronDown
                                    className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
                                        inventoryOpen ? 'rotate-180' : ''
                                    }`}
                                    strokeWidth={2}
                                />
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {inventoryOpen && sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-slate-800 pl-5">
                                        {inventorySubItems.map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <NavLink
                                                    key={item.path}
                                                    to={item.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                            isActive
                                                                ? 'bg-slate-800 text-white'
                                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                                                        }`
                                                    }
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                    <span className="truncate">{item.name}</span>
                                                </NavLink>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                {/* Sidebar footer */}
                <div className="border-t border-slate-800/80 p-4">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100"
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                            {sidebarOpen ? (
                                <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={2} />
                            ) : (
                                <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={2} />
                            )}
                        </span>
                        <AnimatePresence mode="wait">
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -6 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    Collapse
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Main area */}
            <div className="relative flex min-w-0 flex-1 flex-col">
                <header className="z-10 flex h-[72px] items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 backdrop-blur-md md:px-8">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500/80">
                            Overview
                        </p>
                        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white capitalize">
                            {activePage}
                        </h1>
                    </div>

                    <div className="relative" ref={userMenuRef}>
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen((open) => !open)}
                            aria-expanded={userMenuOpen}
                            aria-haspopup="menu"
                            className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/80 px-3 py-2.5 transition-colors hover:border-slate-700 hover:bg-slate-800/80 sm:px-4"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-slate-800 text-sm font-bold text-indigo-400">
                                {userInitial}
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-semibold leading-none text-white">
                                    {user?.role?.name || 'User'}
                                </p>
                                <p className="mt-1.5 max-w-[180px] truncate text-xs text-slate-400">
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronDown
                                className={`hidden h-4 w-4 shrink-0 text-slate-500 transition-transform sm:block ${
                                    userMenuOpen ? 'rotate-180' : ''
                                }`}
                                strokeWidth={2}
                            />
                        </button>

                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900 shadow-xl shadow-black/20"
                                    role="menu"
                                >
                                    <div className="px-2 py-3">
                                        <button
                                            type="button"
                                            onClick={handleProfileNavigate}
                                            role="menuitem"
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-slate-800"
                                        >
                                            <UserCircle className="h-[18px] w-[18px]" strokeWidth={2} />
                                            Profile
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            role="menuitem"
                                            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
                                        >
                                            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 px-6 py-6 md:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AuthLayout