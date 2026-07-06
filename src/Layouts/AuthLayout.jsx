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
    ClipboardList,
    CheckSquare,
    UserCheck,
    History,
    FileText,
    CreditCard,
    Package,
    ArrowLeftRight,
    BarChart3,
    TrendingUp,
    Loader2,
} from 'lucide-react'
import companyLogo from '../assets/Images/company-logo.png.png'
import { logout } from '../utils/auth'

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
]

const manageSubItems = [
    { name: 'Workers', path: '/manage/workers', icon: Users },
    { name: 'Services', path: '/manage/services', icon: CheckSquare },
]

const repairJobsSubItems = [
    { name: 'Repair Requests', path: '/repair/requests', icon: ClipboardList },
    { name: 'Assigned Jobs', path: '/repair/assigned', icon: UserCheck },
    { name: 'Repair History', path: '/repair/history', icon: History },
]

const invoicesSubItems = [
    { name: 'Contracts', path: '/invoices/contracts', icon: FileText },
    { name: 'Transactions', path: '/invoices/transactions', icon: CreditCard },
]

const inventorySubItems = [
    { name: 'Stocks', path: '/inventory/stocks', icon: Package },
    { name: 'Item Movements', path: '/inventory/movements', icon: ArrowLeftRight },
]

const reportsSubItems = [
    { name: 'Revenue', path: '/reports/revenue', icon: TrendingUp },
    { name: 'Repair Jobs', path: '/reports/repairs', icon: Wrench },
    { name: 'Inventory', path: '/reports/inventory', icon: Package },
    { name: 'Vehicles', path: '/reports/vehicles', icon: Car },
    { name: 'Financial', path: '/reports/financial', icon: FileText },
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
    const [reportsOpen, setReportsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const userMenuRef = useRef(null)
    const [user, setUser] = useState({
        name: 'Admin User',
        email: 'administrator@japantrading.com',
        role: { name: 'Admin' },
    })

    const isManageActive = location.pathname.startsWith('/manage')
    const isRepairJobsActive =
        location.pathname.startsWith('/repair') ||
        location.pathname.startsWith('/repair-job') ||
        location.pathname.startsWith('/assign-worker')
    const isinvoicesActive = location.pathname.startsWith('/invoices')
    const isInventoryActive = location.pathname.startsWith('/inventory')
    const isReportsActive = location.pathname.startsWith('/reports')

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
            setReportsOpen(false)
        } else if (isReportsActive) {
            setReportsOpen(true)
            setManageOpen(false)
            setRepairJobsOpen(false)
            setInvoicesOpen(false)
            setInventoryOpen(false)
        } else {
            // Closes all submenus when navigating back to top-level routes like /dashboard or /vehicles
            setManageOpen(false)
            setRepairJobsOpen(false)
            setInvoicesOpen(false)
            setInventoryOpen(false)
            setReportsOpen(false)
        }
    }, [location.pathname, isManageActive, isRepairJobsActive, isinvoicesActive, isInventoryActive, isReportsActive])

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

    const handleLogout = async () => {
        if (isLoggingOut) return

        setIsLoggingOut(true)
        setUserMenuOpen(false)

        try {
            await logout()
        } finally {
            setIsLoggingOut(false)
            navigate('/', { replace: true })
        }
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

        if (location.pathname.startsWith('/repair-job/')) return 'Job Details'
        if (location.pathname.startsWith('/assign-worker')) return 'Assign Worker'
        if (location.pathname === '/vehicles/add') return 'Add Vehicle'
        if (/^\/invoices\/\d+/.test(location.pathname)) return 'View Invoice'

        const invoicesMatch = invoicesSubItems.find((item) => location.pathname === item.path)
        if (invoicesMatch) return invoicesMatch.name

        const inventoryMatch = inventorySubItems.find((item) => location.pathname === item.path)
        if (inventoryMatch) return inventoryMatch.name

        const reportsMatch = reportsSubItems.find((item) => location.pathname === item.path)
        if (reportsMatch) return reportsMatch.name

        return isManageActive ? 'Manage' : isRepairJobsActive ? 'Repair Jobs' : isinvoicesActive ? 'Invoices' : isInventoryActive ? 'Inventory' : isReportsActive ? 'Reports' : 'Console'
    }

    const activePage = getActivePageName()
    const userInitial = user?.role?.name?.charAt(0).toUpperCase() || 'U'

    // Shared classnames for the dropdown triggers, kept in one place so
    // Manage / Repair Jobs / Invoices / Inventory stay visually identical.
    const dropdownTriggerClass = (isActive) =>
        `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
                ? 'bg-indigo-500/10 text-indigo-300'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }`

    const dropdownIconWrapClass = (isActive) =>
        `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isActive ? 'bg-indigo-500/15 text-indigo-300' : 'bg-slate-800/60 text-slate-400'
        }`

    const subItemClass = ({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
        isActive
            ? 'bg-slate-800 text-white'
            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
    }`;

// Tree-style hierarchy: a trunk line runs down from the parent, with a
// short elbow connecting to each child.
const SubNavGroup = ({ items }) => (
    <div className="relative mr-[27px] mt-1 flex flex-col gap-0.5 pb-1.5">
        {/* Vertical Trunk Line */}
        <div className="pointer-events-none absolute left-0 top-0 w-px bg-slate-800" style={{ height: `calc(100% - 15px)` }} />
        
        {items.map((item) => {
            const Icon = item.icon;
            return (
                <div key={item.path} className="relative pl-5">
                    {/* Horizontal Elbow Connector */}
                    <span className="pointer-events-none absolute left-0 top-[17px] h-px w-4 bg-slate-800" />
                    
                    <NavLink to={item.path} className={subItemClass}>
                        <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={2} />
                        <span className="truncate">{item.name}</span>
                    </NavLink>
                </div>
            );
        })}
    </div>
);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
            <motion.aside
                animate={{ width: sidebarOpen ? 216 : 84 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="relative z-20 flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-800/60 bg-slate-900/60"
            >
                {/* Brand */}
                <div className="flex h-16 shrink-0 items-center border-b border-slate-800/60 px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-1.5">
                            <img
                                src={companyLogo}
                                alt="Japan Trading Logo"
                                className="h-full w-auto object-contain"
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
                                    <p className="truncate text-sm font-semibold tracking-tight text-white">
                                        Japan Trading
                                    </p>
                                    <p className="truncate text-[11px] text-slate-500">Workshop console</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
                    <AnimatePresence mode="wait">
                        {sidebarOpen && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600"
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
                                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-indigo-500/10 text-indigo-300'
                                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400" />
                                        )}
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                isActive ? 'bg-indigo-500/15 text-indigo-300' : 'bg-slate-800/60 text-slate-400'
                                            }`}
                                        >
                                            <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
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
                            className={dropdownTriggerClass(isManageActive)}
                        >
                            {isManageActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400" />
                            )}
                            <span className={dropdownIconWrapClass(isManageActive)}>
                                <Settings className="h-[17px] w-[17px]" strokeWidth={2} />
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
                                    className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform ${
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
                                    <SubNavGroup items={manageSubItems} />
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
                            className={dropdownTriggerClass(isRepairJobsActive)}
                        >
                            {isRepairJobsActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400" />
                            )}
                            <span className={dropdownIconWrapClass(isRepairJobsActive)}>
                                <Wrench className="h-[17px] w-[17px]" strokeWidth={2} />
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
                                    className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform ${
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
                                    <SubNavGroup items={repairJobsSubItems} />
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
                            className={dropdownTriggerClass(isinvoicesActive)}
                        >
                            {isinvoicesActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400" />
                            )}
                            <span className={dropdownIconWrapClass(isinvoicesActive)}>
                                <CreditCard className="h-[17px] w-[17px]" strokeWidth={2} />
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
                                    className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform ${
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
                                    <SubNavGroup items={invoicesSubItems} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Inventory Dropdown */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setInventoryOpen((open) => !open)}
                            title={!sidebarOpen ? 'Inventory' : undefined}
                            className={dropdownTriggerClass(isInventoryActive)}
                        >
                            {isInventoryActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400" />
                            )}
                            <span className={dropdownIconWrapClass(isInventoryActive)}>
                                <Package className="h-[17px] w-[17px]" strokeWidth={2} />
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
                                    className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform ${
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
                                    <SubNavGroup items={inventorySubItems} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Reports Dropdown */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setReportsOpen((open) => !open)}
                            title={!sidebarOpen ? 'Reports' : undefined}
                            className={dropdownTriggerClass(isReportsActive)}
                        >
                            {isReportsActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400" />
                            )}
                            <span className={dropdownIconWrapClass(isReportsActive)}>
                                <BarChart3 className="h-[17px] w-[17px]" strokeWidth={2} />
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
                                        Reports
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {sidebarOpen && (
                                <ChevronDown
                                    className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                                        reportsOpen ? 'rotate-180' : ''
                                    }`}
                                    strokeWidth={2}
                                />
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {reportsOpen && sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <SubNavGroup items={reportsSubItems} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                {/* Sidebar footer */}
                <div className="shrink-0 border-t border-slate-800/60 p-3">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200"
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                            {sidebarOpen ? (
                                <PanelLeftClose className="h-[17px] w-[17px]" strokeWidth={2} />
                            ) : (
                                <PanelLeftOpen className="h-[17px] w-[17px]" strokeWidth={2} />
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
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 backdrop-blur-md md:px-8">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                            Overview
                        </p>
                        <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-white capitalize">
                            {activePage}
                        </h1>
                    </div>

                    <div className="relative" ref={userMenuRef}>
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen((open) => !open)}
                            aria-expanded={userMenuOpen}
                            aria-haspopup="menu"
                            className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2 transition-colors hover:border-slate-700 hover:bg-slate-800/60 sm:px-3.5"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-300">
                                {userInitial}
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-medium leading-none text-white">
                                    {user?.role?.name || 'User'}
                                </p>
                                <p className="mt-1.5 max-w-[180px] truncate text-xs text-slate-500">
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
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/30"
                                    role="menu"
                                >
                                    <div className="p-1.5">
                                        <button
                                            type="button"
                                            onClick={handleProfileNavigate}
                                            role="menuitem"
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
                                        >
                                            <UserCircle className="h-[17px] w-[17px]" strokeWidth={2} />
                                            Profile
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            role="menuitem"
                                            className="mt-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isLoggingOut ? (
                                                <Loader2 className="h-[17px] w-[17px] animate-spin" strokeWidth={2} />
                                            ) : (
                                                <LogOut className="h-[17px] w-[17px]" strokeWidth={2} />
                                            )}
                                            {isLoggingOut ? 'Signing out...' : 'Logout'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <main className="scrollbar-none min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 px-6 py-2 md:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AuthLayout
