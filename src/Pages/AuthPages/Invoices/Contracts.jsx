import { motion } from "framer-motion";
import { $api } from "../../../api/client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

const STATUS_STYLES = {
    unpaid: "border-amber-900/50 bg-amber-900/20 text-amber-400 [&>span]:bg-amber-500",
    paid: "border-green-900/50 bg-green-900/20 text-green-400 [&>span]:bg-green-500",
    overdue: "border-red-900/50 bg-red-900/20 text-red-400 [&>span]:bg-red-500",
    partial: "border-sky-900/50 bg-sky-900/20 text-sky-400 [&>span]:bg-sky-500",
};

const getStatusStyle = (status) =>
    STATUS_STYLES[status] || "border-slate-800 bg-slate-900/40 text-slate-400 [&>span]:bg-slate-500";

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Contracts = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: contracts = [], isLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: () => $api("/invoices"),
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContracts = contracts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(contracts.length / itemsPerPage);

    const totals = {
        total: contracts.length,
        unpaid: contracts.filter((c) => c.status === "unpaid").length,
        totalAmount: contracts.reduce((sum, c) => sum + Number(c.total_amount || 0), 0),
        totalDue: contracts.reduce((sum, c) => sum + Number(c.amount_due || 0), 0),
    };

    const STAT_CARDS = [
        { key: "total", label: "Total Invoices", value: totals.total, icon: FileText, accent: "text-slate-300", ring: "bg-slate-800/80 border-slate-700/50" },
        { key: "unpaid", label: "Unpaid", value: totals.unpaid, icon: AlertCircle, accent: "text-amber-400", ring: "bg-amber-500/10 border-amber-500/20" },
        { key: "totalAmount", label: "Total Billed", value: `$${formatCurrency(totals.totalAmount)}`, icon: DollarSign, accent: "text-sky-400", ring: "bg-sky-500/10 border-sky-500/20" },
        { key: "totalDue", label: "Amount Due", value: `$${formatCurrency(totals.totalDue)}`, icon: CheckCircle2, accent: "text-green-400", ring: "bg-green-500/10 border-green-500/20" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
        >
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                <h1 className="text-lg font-semibold tracking-tight text-white mb-6">Contracts</h1>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {STAT_CARDS.map(({ key, label, value, icon: Icon, accent, ring }) => (
                        <div
                            key={key}
                            className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/70 rounded-xl p-4"
                        >
                            <span className={`flex items-center justify-center h-9 w-9 rounded-lg border shrink-0 ${ring} ${accent}`}>
                                <Icon size={16} />
                            </span>
                            <div className="min-w-0">
                                <div className={`text-xl font-semibold leading-none ${accent}`}>{value}</div>
                                <div className="text-[11px] text-slate-500 mt-1 truncate">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30 backdrop-blur-sm">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                                <th className="py-3.5 px-4 w-16">ID</th>
                                <th className="py-3.5 px-4">Invoice Number</th>
                                <th className="py-3.5 px-4">Job ID</th>
                                <th className="py-3.5 px-4">Type</th>
                                <th className="py-3.5 px-4 text-right">Total Amount</th>
                                <th className="py-3.5 px-4 text-right">Amount Due</th>
                                <th className="py-3.5 px-4">Created</th>
                                <th className="py-3.5 px-4 text-center w-28">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center">
                                        <span className="text-slate-500 italic text-xs">Loading invoices...</span>
                                    </td>
                                </tr>
                            ) : currentContracts.length > 0 ? (
                                currentContracts.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-800/20 group transition-colors duration-150">
                                        <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                            #{invoice.id}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shrink-0">
                                                    <FileText size={13} />
                                                </span>
                                                <span className="font-mono text-slate-200 group-hover:text-white transition-colors">
                                                    {invoice.invoice_number}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4 font-mono text-slate-400">
                                            #{invoice.repair_job_id}
                                        </td>

                                        <td className="p-4">
                                            <span className="text-[10px] font-medium bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 capitalize">
                                                {invoice.type?.replace(/_/g, " ")}
                                            </span>
                                        </td>

                                        <td className="p-4 text-right font-semibold text-slate-200 font-mono tabular-nums">
                                            ${formatCurrency(invoice.total_amount)}
                                        </td>

                                        <td className="p-4 text-right font-mono tabular-nums">
                                            <span className={Number(invoice.amount_due) > 0 ? "text-amber-400 font-semibold" : "text-slate-500"}>
                                                ${formatCurrency(invoice.amount_due)}
                                            </span>
                                        </td>

                                        <td className="p-4 text-slate-400">
                                            {formatDate(invoice.created_at)}
                                        </td>

                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getStatusStyle(invoice.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"></span>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <FileText size={20} className="text-slate-700" />
                                            <span className="italic text-xs">No invoices found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
                        <div>
                            Showing <span className="text-slate-200 font-medium">{indexOfFirstItem + 1}</span> to{" "}
                            <span className="text-slate-200 font-medium">{Math.min(indexOfLastItem, contracts.length)}</span> of{" "}
                            <span className="text-slate-200 font-medium">{contracts.length}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:border-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-2 text-slate-600 font-mono">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:border-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Contracts;