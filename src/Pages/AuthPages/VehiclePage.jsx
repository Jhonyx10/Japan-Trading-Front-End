import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
    Plus,
    Car,
    Loader2,
    Tag,
    Wrench,
    Ban,
    PauseCircle,
    CheckCircle2,
    Hash,
    Cog,
    Gauge,
} from 'lucide-react'
import { $api } from '../../api/client'
import Pagination from '../../components/Pagination'

const ITEMS_PER_PAGE = 6

const STATUS_CONFIG = {
    for_sale: {
        label: 'For Sale',
        icon: Tag,
        badge: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400',
        ring: 'group-hover:border-emerald-500/30',
        accent: 'from-emerald-500/20 via-transparent to-transparent',
    },
    for_repair: {
        label: 'For Repair',
        icon: Wrench,
        badge: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
        dot: 'bg-amber-400',
        ring: 'group-hover:border-amber-500/30',
        accent: 'from-amber-500/20 via-transparent to-transparent',
    },
    unavailable: {
        label: 'Unavailable',
        icon: Ban,
        badge: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
        dot: 'bg-slate-400',
        ring: 'group-hover:border-slate-500/40',
        accent: 'from-slate-500/20 via-transparent to-transparent',
    },
    on_hold: {
        label: 'On Hold',
        icon: PauseCircle,
        badge: 'text-violet-300 bg-violet-500/15 border-violet-500/30',
        dot: 'bg-violet-400',
        ring: 'group-hover:border-violet-500/30',
        accent: 'from-violet-500/20 via-transparent to-transparent',
    },
    sold: {
        label: 'Sold',
        icon: CheckCircle2,
        badge: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
        dot: 'bg-sky-400',
        ring: 'group-hover:border-sky-500/30',
        accent: 'from-sky-500/20 via-transparent to-transparent',
    },
}

const DEFAULT_STATUS = {
    label: 'Unknown',
    icon: Car,
    badge: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
    dot: 'bg-slate-400',
    ring: 'group-hover:border-slate-600',
    accent: 'from-slate-500/10 via-transparent to-transparent',
}

const formatPrice = (value) => {
    if (value == null || value === '') return null
    return `$${Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`
}

const getStatusConfig = (status) => {
    const key = String(status ?? '').toLowerCase()
    return STATUS_CONFIG[key] ?? {
        ...DEFAULT_STATUS,
        label: key ? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—',
    }
}

const VehiclePage = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vehicles', currentPage],
        queryFn: () => $api('/vehicles', { query: { page: currentPage } }),
        placeholderData: keepPreviousData,
    })

    const vehicles = Array.isArray(data?.data ?? data) ? (data?.data ?? data) : []
    const lastPage = data?.last_page ?? 1
    const total = data?.total ?? vehicles.length

    const getVehicleImage = (vehicle) => vehicle.image_url || vehicle.image || null

    const goToPage = (page) => {
        if (page < 1 || page > lastPage || page === currentPage) return
        setCurrentPage(page)
    }

    const errorMessage = error?.data?.message || error?.message || 'Failed to load vehicles.'

    const statusCounts = vehicles.reduce((acc, v) => {
        const key = String(v.status ?? 'unknown').toLowerCase()
        acc[key] = (acc[key] ?? 0) + 1
        return acc
    }, {})

    const summaryCards = [
        { key: 'total', label: 'On This Page', value: vehicles.length, icon: Car, accent: 'text-slate-200', ring: 'bg-slate-800/80 border-slate-700/50' },
        { key: 'for_sale', label: 'For Sale', value: statusCounts.for_sale ?? 0, icon: Tag, accent: 'text-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/20' },
        { key: 'for_repair', label: 'For Repair', value: statusCounts.for_repair ?? 0, icon: Wrench, accent: 'text-amber-400', ring: 'bg-amber-500/10 border-amber-500/20' },
        { key: 'sold', label: 'Sold', value: statusCounts.sold ?? 0, icon: CheckCircle2, accent: 'text-sky-400', ring: 'bg-sky-500/10 border-sky-500/20' },
    ]

    return (
        <div className="p-2">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-[calc(100vh-112px)] w-full max-w-full flex-col gap-4 overflow-hidden px-6 py-1"
            >
                <div className="flex shrink-0 items-center justify-between py-1">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 mb-0.5">
                            Fleet Management
                        </p>
                        <h1 className="text-lg font-semibold text-white">Vehicles</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/vehicles/add')}
                        className="group flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-5 py-2.5 text-md font-semibold text-indigo-300 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-200 active:scale-[0.97] cursor-pointer"
                    >
                        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
                        <span>Add Vehicle</span>
                    </button>
                </div>

                {!isLoading && !isError && vehicles.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                        {summaryCards.map(({ key, label, value, icon: Icon, accent, ring }) => (
                            <div
                                key={key}
                                className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5"
                            >
                                <span className={`flex items-center justify-center h-9 w-9 rounded-lg border shrink-0 ${ring} ${accent}`}>
                                    <Icon size={16} />
                                </span>
                                <div className="min-w-0">
                                    <p className={`text-xl font-semibold leading-none ${accent}`}>{value}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 truncate">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-full pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
                            <Loader2 size={28} className="animate-spin text-sky-500" />
                            <span className="text-sm">Loading vehicles...</span>
                        </div>
                    )}

                    {isError && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                            {errorMessage}
                        </div>
                    )}

                    {!isLoading && !isError && vehicles.length === 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-16 text-center">
                            <span className="inline-flex items-center justify-center h-14 w-14 rounded-2xl border border-slate-800 bg-slate-950 text-slate-500 mb-4">
                                <Car size={24} />
                            </span>
                            <p className="text-sm font-medium text-slate-300">No vehicles found yet</p>
                            <p className="text-xs text-slate-500 mt-1">Add a vehicle to start building your fleet.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                        {vehicles.map((vehicle, index) => {
                            const status = getStatusConfig(vehicle.status)
                            const StatusIcon = status.icon
                            const price = formatPrice(vehicle.price)
                            const image = getVehicleImage(vehicle)

                            return (
                                <motion.article
                                    key={vehicle.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: index * 0.04 }}
                                    whileHover={{ y: -4 }}
                                    className={`group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-lg transition-all duration-300 ${status.ring}`}
                                >
                                    <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                                        {image ? (
                                            <>
                                                <img
                                                    src={image}
                                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className={`absolute inset-0 bg-gradient-to-t ${status.accent} via-slate-950/20 to-slate-950/70`} />
                                            </>
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 to-slate-950">
                                                <Car size={32} className="text-slate-700" strokeWidth={1.5} />
                                                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                                                    No image
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute top-3 left-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${status.badge}`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                <StatusIcon size={11} strokeWidth={2.5} />
                                                {status.label}
                                            </span>
                                        </div>

                                        {price && (
                                            <div className="absolute bottom-3 right-3">
                                                <span className="rounded-lg border border-white/10 bg-slate-950/70 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
                                                    {price}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="mb-3">
                                            <h2 className="text-base font-bold text-white truncate">
                                                {vehicle.brand} {vehicle.model}
                                            </h2>
                                            {vehicle.body_type && (
                                                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                                                    {vehicle.body_type}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/50 px-2.5 py-2 min-w-0">
                                                <Hash size={12} className="text-slate-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[9px] uppercase tracking-wider text-slate-600">Plate</p>
                                                    <p className="text-xs font-medium text-slate-200 truncate">
                                                        {vehicle.plate_number || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/50 px-2.5 py-2 min-w-0">
                                                <Cog size={12} className="text-slate-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[9px] uppercase tracking-wider text-slate-600">Chassis</p>
                                                    <p className="text-xs font-medium text-slate-200 truncate">
                                                        {vehicle.chassis_number || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {(vehicle.engine_type || vehicle.transmission) && (
                                            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                                                {vehicle.engine_type && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-400 capitalize">
                                                        <Gauge size={10} />
                                                        {vehicle.engine_type}
                                                    </span>
                                                )}
                                                {vehicle.transmission && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-400 capitalize">
                                                        {vehicle.transmission}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.article>
                            )
                        })}
                    </div>
                </div>

                {!isLoading && !isError && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={lastPage}
                        totalItems={total}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={goToPage}
                        itemLabel="vehicles"
                        className="mt-auto shrink-0 w-full"
                    />
                )}
            </motion.div>
        </div>
    )
}

export default VehiclePage
