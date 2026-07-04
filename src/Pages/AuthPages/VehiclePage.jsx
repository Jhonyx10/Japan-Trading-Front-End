import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { $api } from '../../api/client'

const ITEMS_PER_PAGE = 6

const VehiclePage = () => {
    const [currentPage, setCurrentPage] = useState(1)

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vehicles', currentPage],
        queryFn: () => $api('/vehicles', { query: { page: currentPage } }),
        placeholderData: keepPreviousData,
    })

    const vehicles = Array.isArray(data?.data ?? data) ? (data?.data ?? data) : []
    const lastPage = data?.last_page ?? 1
    const total = data?.total ?? vehicles.length

    const formatStatus = (status) => {
        if (!status) return '—'
        return String(status).replace(/_/g, ' ')
    }

    const getVehicleImage = (vehicle) => vehicle.image_url || vehicle.image || null

    const goToPage = (page) => {
        if (page < 1 || page > lastPage || page === currentPage) return
        setCurrentPage(page)
    }

    const pageNumbers = Array.from({ length: lastPage }, (_, index) => index + 1)

    const from = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
    const to = Math.min(currentPage * ITEMS_PER_PAGE, total)

    const errorMessage = error?.data?.message || error?.message || 'Failed to load vehicles.'

    return (
        <div className="p-2">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-[calc(100vh-112px)] w-full max-w-full flex-col gap-4 overflow-hidden px-6 py-1"
            >
                {/* Header Toolbar */}
                <div className="flex shrink-0 items-center justify-end py-1">
                    <button className="group flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-5 py-2.5 text-md mr-4 font-semibold text-indigo-300 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-200 active:scale-[0.97] cursor-pointer">
                        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
                        <span>Add Vehicle</span>
                    </button>
                </div>

                {/* Main Data Container */}
                <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-full pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {isLoading && (
                        <p className="text-sm text-slate-400">Loading vehicles...</p>
                    )}

                    {isError && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                            {errorMessage}
                        </div>
                    )}

                    {!isLoading && !isError && vehicles.length === 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center">
                            <p className="text-sm text-slate-400">No vehicles found yet.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 w-full">
                        {vehicles.map((vehicle) => (
                            <motion.div
                                key={vehicle.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ y: -2 }}
                                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-md"
                            >
                                <div className="h-40 w-full bg-slate-800">
                                    {getVehicleImage(vehicle) ? (
                                        <img
                                            src={getVehicleImage(vehicle)}
                                            alt={`${vehicle.brand} ${vehicle.model}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                            No image
                                        </div>
                                    )}{' '}
                                </div>

                                <div className="p-3">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <h2 className="truncate text-sm font-semibold text-white">
                                            {vehicle.brand} {vehicle.model}
                                        </h2>
                                        <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium capitalize text-indigo-300">
                                            {formatStatus(vehicle.status)}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-xs text-slate-400">
                                        <p className="truncate">
                                            <span className="text-slate-500">Plate:</span>{' '}
                                            <span className="text-slate-200">{vehicle.plate_number}</span>
                                        </p>
                                        <p className="truncate">
                                            <span className="text-slate-500">Chassis:</span>{' '}
                                            <span className="text-slate-200">{vehicle.chassis_number}</span>
                                        </p>
                                        <p className="truncate">
                                            <span className="text-slate-500">Body:</span>{' '}
                                            <span className="text-slate-200">{vehicle.body_type}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Fixed Pagination Bar at Bottom */}
                {!isLoading && !isError && lastPage > 1 && (
                    <div className="mt-auto shrink-0 flex flex-col items-center gap-3 border-t border-slate-800/80 bg-slate-950 pt-3 pb-2 w-full">
                        <p className="text-xs text-slate-500">
                            Showing {from}–{to} of {total} vehicles
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                            </button>

                            {pageNumbers.map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => goToPage(page)}
                                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors cursor-pointer ${page === currentPage
                                            ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20'
                                            : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default VehiclePage