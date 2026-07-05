import { motion } from "framer-motion";
import { $api } from "../../../api/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, DollarSign, AlertCircle, CheckCircle2, Eye, Link2 } from "lucide-react";
import Pagination from "../../../components/Pagination";

const STATUS_STYLES = {
    unpaid: "border-amber-900/50 bg-amber-900/20 text-amber-400 [&>span]:bg-amber-500",
    paid: "border-green-900/50 bg-green-900/20 text-green-400 [&>span]:bg-green-500",
    overdue: "border-red-900/50 bg-red-900/20 text-red-400 [&>span]:bg-red-500",
    partially_paid: "border-sky-900/50 bg-sky-900/20 text-sky-400 [&>span]:bg-sky-500",
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

const getParentInvoice = (invoice) => invoice.parent ?? null;
const getChildInvoices = (invoice) => invoice.children ?? [];

const Contracts = () => {
    const navigate = useNavigate();
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
                    <table className="w-full text-left border-collapse min-w-[960px]">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                                <th className="py-3.5 px-4 w-16">ID</th>
                                <th className="py-3.5 px-4">Invoice Number</th>
                                <th className="py-3.5 px-4">Linked To</th>
                                <th className="py-3.5 px-4">Job ID</th>
                                <th className="py-3.5 px-4">Type</th>
                                <th className="py-3.5 px-4 text-right">Total Amount</th>
                                <th className="py-3.5 px-4 text-right">Amount Due</th>
                                <th className="py-3.5 px-4">Created</th>
                                <th className="py-3.5 px-4 text-center w-28">Status</th>
                                <th className="py-3.5 px-4 text-center w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="10" className="p-10 text-center">
                                        <span className="text-slate-500 italic text-xs">Loading invoices...</span>
                                    </td>
                                </tr>
                            ) : currentContracts.length > 0 ? (
                                currentContracts.map((invoice) => {
                                    const parent = getParentInvoice(invoice);
                                    const children = getChildInvoices(invoice);
                                    const isSupplemental = Boolean(invoice.parent_id);

                                    return (
                                    <tr key={invoice.id} className="hover:bg-slate-800/20 group transition-colors duration-150">
                                        <td className="p-4 font-mono font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                            #{invoice.id}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-900/90 border border-slate-800 text-slate-500 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors shrink-0">
                                                    <FileText size={13} />
                                                </span>
                                                <div className="min-w-0">
                                                    <span className="font-mono text-slate-200 group-hover:text-white transition-colors block truncate">
                                                        {invoice.invoice_number}
                                                    </span>
                                                    {isSupplemental && (
                                                        <span className="text-[9px] font-medium text-amber-400/90 uppercase tracking-wide">
                                                            Additional work
                                                        </span>
                                                    )}
                                                    {children.length > 0 && (
                                                        <span className="text-[9px] font-medium text-indigo-400/90">
                                                            {children.length} add-on{children.length > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {parent ? (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/invoices/${parent.id}`)}
                                                    className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-md cursor-pointer max-w-[140px]"
                                                    title="Original invoice"
                                                >
                                                    <Link2 size={10} className="shrink-0" />
                                                    <span className="truncate font-mono">{parent.invoice_number}</span>
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-medium text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
                                                    Original
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 font-mono text-slate-400">
                                            {invoice.repair_job_id ? `#${invoice.repair_job_id}` : '—'}
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
                                                {invoice.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                                                className="inline-flex items-center gap-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Eye size={12} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" className="p-10 text-center">
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={contracts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </motion.div>
    );
};

export default Contracts;