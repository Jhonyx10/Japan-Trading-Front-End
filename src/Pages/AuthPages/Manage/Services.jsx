import { motion } from 'framer-motion'
import { $api } from '../../../api/client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AddServiceModal from '../../../components/modals/AddServiceModal'

const Services = () => {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => $api('/services'),
    })

    const getWorkerCounts = () => {
        const roleWorkersTracker = {}

        services.forEach(service => {
            const roleName = service?.required_worker_type?.name || 'Unassigned'
            const usersInRole = service?.required_worker_type?.users || []

            if (!roleWorkersTracker[roleName]) {
                roleWorkersTracker[roleName] = new Set()
            }

            if (Array.isArray(usersInRole)) {
                usersInRole.forEach(user => {
                    if (user?.id) roleWorkersTracker[roleName].add(user.id)
                })
            } else if (usersInRole?.id) {
                roleWorkersTracker[roleName].add(usersInRole.id)
            }
        })

        return Object.entries(roleWorkersTracker).map(([role, workerSet]) => [
            role,
            workerSet.size,
        ])
    }

    const handleServiceCreated = () => {
        queryClient.invalidateQueries({ queryKey: ['services'] })
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    }

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden p-6 md:p-12 selection:bg-emerald-500/30">
            {/* Ambient background accent blurs */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[180px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-600/[0.03] blur-[180px] pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto space-y-10 relative z-10"
            >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-slate-900 pb-6">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                            System Management
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Workshop Services</h1>
                    </div>

                    <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ y: 0 }}
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                        Add New Service
                    </motion.button>
                </div>

                {/* Worker Breakdown Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {getWorkerCounts().map(([role, count]) => (
                        <div key={role} className="bg-slate-900/20 backdrop-blur border border-slate-900 rounded-xl p-6">
                            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{role}</h3>
                            <p className="text-2xl font-semibold text-white mt-2 flex items-baseline gap-1.5">
                                {count}
                                <span className="text-xs font-normal text-slate-500">Active Workers</span>
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Services Table */}
                <motion.div variants={itemVariants} className="overflow-hidden border border-slate-900 rounded-xl bg-slate-900/10 backdrop-blur">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-slate-900/40 border-b border-slate-900 text-slate-400 font-medium">
                                    <th className="p-4 pl-6 w-1/2">Service Summary Details</th>
                                    <th className="p-4 w-1/4">Expert Assignment</th>
                                    <th className="p-4 pr-6 text-right w-1/4">Base Price Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/40">
                                {services.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500 tracking-wide">No configuration profiles mapped to this register.</td>
                                    </tr>
                                ) : (
                                    services.map((service, index) => (
                                        <tr key={service.id || index} className="hover:bg-slate-900/20 transition-colors duration-150">
                                            <td className="p-4 pl-6">
                                                <div className="font-medium text-slate-200 text-base">{service.name}</div>
                                                <div className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-xl">{service.description || 'No descriptive logs attached.'}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium tracking-wide ${service?.required_worker_type?.name
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                                        : 'bg-slate-900 text-slate-500'
                                                    }`}>
                                                    {service?.required_worker_type?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right font-mono font-medium text-slate-300">
                                                {service.base_price || service.price ? `$${Number(service.base_price || service.price).toFixed(2)}` : '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>

            {/* Extracted Standalone Modal Subsystem */}
            <AddServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onServiceCreated={handleServiceCreated}
                onSubmitApi={$api}
            />
        </div>
    )
}

export default Services