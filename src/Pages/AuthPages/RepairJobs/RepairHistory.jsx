import { motion } from 'framer-motion'

const RepairHistory = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
        >
            <h1>Repair History</h1>
        </motion.div>
    )
}

export default RepairHistory