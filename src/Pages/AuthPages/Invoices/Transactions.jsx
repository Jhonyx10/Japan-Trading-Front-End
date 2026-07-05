import { motion } from "framer-motion";
import { $api } from "../../../api/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    CreditCard,
    DollarSign,
    CheckCircle2,
    Receipt,
    ArrowRightLeft,
} from "lucide-react";
import Pagination from "../../../components/Pagination";

const STATUS_STYLES = {
    successful: "border-green-900/50 bg-green-900/20 text-green-400 [&>span]:bg-green-500",
    pending: "border-amber-900/50 bg-amber-900/20 text-amber-400 [&>span]:bg-amber-500",
    failed: "border-red-900/50 bg-red-900/20 text-red-400 [&>span]:bg-red-500",
};

const TYPE_STYLES = {
    down_payment: "border-sky-900/50 bg-sky-900/20 text-sky-400",
    repair_down_payment: "border-indigo-900/50 bg-indigo-900/20 text-indigo-400",
};

const getStatusStyle = (status) =>
    STATUS_STYLES[status] || "border-slate-800 bg-slate-900/40 text-slate-400 [&>span]:bg-slate-500";

const getTypeStyle = (type) =>
    TYPE_STYLES[type] || "border-slate-800 bg-slate-900/40 text-slate-400";

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const Transactions = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => $api("/transactions"),
    });

    const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setCurrentPage(page);
    };

    const totals = {
        total: transactions.length,
        successful: transactions.filter((t) => t.status === "successful").length,
        totalPaid: transactions.reduce((sum, t) => sum + Number(t.amount_paid || 0), 0),
    };

    const STAT_CARDS = [
        {
            key: "total",
            label: "Total Transactions",
            value: totals.total,
            icon: ArrowRightLeft,
            accent: "text-slate-300",
            ring: "bg-slate-800/80 border-slate-700/50",
        },
        {
            key: "successful",
            label: "Successful",
            value: totals.successful,
            icon: CheckCircle2,
            accent: "text-green-400",
            ring: "bg-green-500/10 border-green-500/20",
        },
        {
            key: "totalPaid",
            label: "Total Collected",
            value: `$${formatCurrency(totals.totalPaid)}`,
            icon: DollarSign,
            accent: "text-sky-400",
            ring: "bg-sky-500/10 border-sky-500/20",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-lg font-semibold tracking-tight text-white mb-6"
                >
                    Transactions
                </motion.h1>

                {/* Stat Cards */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
                >
                    {STAT_CARDS.map(({ key, label, value, icon: Icon, accent, ring }) => (
                        <motion.div
                            key={key}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/70 rounded-xl p-4"
                        >
                            <span
                                className={`flex items-center justify-center h-9 w-9 rounded-lg border shrink-0 ${ring} ${accent}`}
                            >
                                <Icon size={16} />
                            </span>
                            <div className="min-w-0">
                                <div className={`text-xl font-semibold leading-none ${accent}`}>
                                    {value}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 truncate">
                                    {label}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Table */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30 backdrop-blur-sm"
                >
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                                <th className="py-3.5 px-4 w-16">ID</th>
                                <th className="py-3.5 px-4">Invoice Number</th>
                                <th className="py-3.5 px-4 text-right">Invoice Total</th>
                                <th className="py-3.5 px-4">Payment Method</th>
                                <th className="py-3.5 px-4">Type</th>
                                <th className="py-3.5 px-4">Reference</th>
                                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                                <th className="py-3.5 px-4 text-center w-28">Status</th>
                                <th className="py-3.5 px-4">Paid At</th>
                                <th className="py-3.5 px-4">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="10" className="p-10 text-center">
                                        <motion.span
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-slate-500 italic text-xs"
                                        >
                                            Loading transactions...
                                        </motion.span>
                                    </td>
                                </tr>
                            ) : currentTransactions.length > 0 ? (
                                currentTransactions.map((transaction, index) => (
                                    <motion.tr
                                        key={transaction.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.04 }}
                                        className="hover:bg-slate-800/20 group transition-colors duration-150"
                                    >
                                        <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                            #{transaction.id}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shrink-0">
                                                    <Receipt size={13} />
                                                </span>
                                                {(transaction.invoice_id ?? transaction.invoice?.id) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/invoices/${transaction.invoice_id ?? transaction.invoice?.id}`
                                                            )
                                                        }
                                                        className="font-mono text-slate-200 group-hover:text-sky-400 transition-colors cursor-pointer text-left"
                                                    >
                                                        {transaction.invoice?.invoice_number ??
                                                            `#${transaction.invoice_id}`}
                                                    </button>
                                                ) : (
                                                    <span className="font-mono text-slate-500">—</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4 text-right font-semibold text-slate-200 font-mono tabular-nums">
                                            ${formatCurrency(transaction.invoice?.total_amount)}
                                        </td>

                                        <td className="p-4">
                                            <span className="text-[10px] font-medium bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                                                {transaction.payment_method?.replace(/_/g, " ") ?? "—"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getTypeStyle(transaction.type)}`}
                                            >
                                                {transaction.type?.replace(/_/g, " ") ?? "—"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="font-mono text-[10px] uppercase bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-slate-400 max-w-[140px] truncate inline-block">
                                                {transaction.transaction_reference || "—"}
                                            </span>
                                        </td>

                                        <td className="p-4 text-right font-mono tabular-nums">
                                            <span className="text-green-400 font-semibold">
                                                ${formatCurrency(transaction.amount_paid)}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getStatusStyle(transaction.status)}`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" />
                                                {transaction.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-slate-400 text-nowrap">
                                            {formatDate(transaction.paid_at)}
                                        </td>

                                        <td className="p-4 text-slate-400 text-nowrap">
                                            {formatDate(transaction.created_at)}
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="p-10 text-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-2 text-slate-500"
                                        >
                                            <CreditCard size={20} className="text-slate-700" />
                                            <span className="italic text-xs">No transactions found.</span>
                                        </motion.div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={transactions.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                />
            </motion.div>
        </motion.div>
    );
};

export default Transactions;
