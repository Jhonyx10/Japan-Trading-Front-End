import { motion } from 'framer-motion'

const DashboardPage = () => {
    const stats = [
        { title: 'Total Imports', value: '$842,500', change: '+12.5%', color: 'from-blue-500 to-indigo-500' },
        { title: 'Pending Shipments', value: '47', change: '+3.2%', color: 'from-violet-500 to-purple-500' },
        { title: 'Completed Orders', value: '1,280', change: '+8.7%', color: 'from-emerald-500 to-teal-500' }
    ]

    const activities = [
        { id: 1, action: 'Shipment #4021 dispatched (Tokyo Port)', time: '2 hours ago', status: 'In Transit' },
        { id: 2, action: 'Invoice match verified (Osaka Logistics)', time: '4 hours ago', status: 'Verified' },
        { id: 3, action: 'Customs clearance approved (Yokohama)', time: '1 day ago', status: 'Cleared' }
    ]

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-slate-900 border border-indigo-800/20 rounded-2xl p-6"
            >
                <h2 className="text-2xl font-bold text-white">Japan Trading Operations</h2>
                <p className="text-sm text-slate-300 mt-1">
                    Monitor shipping logistics, cargo clearance, and financial accounting reports.
                </p>
            </motion.div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-lg"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${stat.color} opacity-80`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Activities Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-white">Recent Activities</h3>
                    <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                        View Logistics Hub
                    </button>
                </div>

                <div className="divide-y divide-slate-800/60 space-y-4">
                    {activities.map((act) => (
                        <div key={act.id} className="flex justify-between items-center pt-4 first:pt-0">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🚢</span>
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{act.action}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{act.time}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                                {act.status}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default DashboardPage
