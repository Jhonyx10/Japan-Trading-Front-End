import { motion } from "framer-motion";

const Payments = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
        >
            <h1 className="text-2xl font-bold text-white">Payments</h1>
        </motion.div>
    );
};

export default Payments;