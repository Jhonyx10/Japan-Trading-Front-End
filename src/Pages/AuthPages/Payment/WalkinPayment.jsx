import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $api } from "../../../api/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Receipt, CreditCard, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "../../../utils/currency";

const PAYMENT_TYPES = [
    { value: "repair_down_payment", label: "Down Payment (30%)" },
    { value: "repair_partial_payment", label: "Partial Payment" },
    { value: "repair_final_payment", label: "Final Payment" },
];

const WalkinPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [invoiceId] = useState(location.state?.invoiceId ?? "");
    const [repairJobId] = useState(location.state?.repairJobId ?? "");
    const [type, setType] = useState("repair_down_payment");
    const [amount, setAmount] = useState("");

    const {
        data: invoice,
        isFetching: isLoadingInvoice,
        isError: invoiceNotFound,
    } = useQuery({
        queryKey: ["invoice", invoiceId],
        queryFn: () => $api(`/invoices/${invoiceId}`),
        enabled: Boolean(invoiceId),
        retry: false,
    });

    // Auto-calculate 30% down payment once the invoice loads, and whenever
    // the type is switched to/back to "repair_down_payment"
    const isDownPaymentDisabled = invoice?.status === "partially_paid";

    useEffect(() => {
        if (invoice && type === "repair_down_payment") {
            const downPayment = (parseFloat(invoice.total_amount) * 0.3).toFixed(2);
            setAmount(downPayment);
        }
        if (isDownPaymentDisabled && type === "repair_down_payment") {
            setType("repair_partial_payment");
        }
    }, [invoice, type]);

    const { mutate, isPending, isSuccess, isError, error, reset } = useMutation({
        mutationFn: () =>
            $api("/payments/walk-in", {
                method: "POST",
                body: {
                    repair_job_id: repairJobId,
                    invoice_id: invoiceId,
                    type,
                    amount,
                },
            }),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate();
    };

    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
            const timer = setTimeout(() => navigate.back(), 1500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate]);

    const isDownPayment = type === "repair_down_payment";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden"
        >
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto w-full px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CreditCard size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            Walk-in Payment
                        </span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Record a Payment
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Invoice #{invoiceId || "—"}
                    </p>
                </motion.div>

                {/* Invoice details card */}
                <AnimatePresence mode="wait">
                    {isLoadingInvoice && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-slate-500 text-sm mb-6 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                        >
                            <Loader2 size={15} className="animate-spin" />
                            Loading invoice details...
                        </motion.div>
                    )}

                    {invoiceNotFound && !isLoadingInvoice && (
                        <motion.div
                            key="not-found"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 mb-6 text-sm"
                        >
                            <XCircle size={16} />
                            Could not load this invoice.
                        </motion.div>
                    )}

                    {invoice && (
                        <motion.div
                            key="invoice-card"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-5 mb-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Receipt size={15} className="text-emerald-400" />
                                    <span className="text-sm font-semibold">
                                        {invoice.invoice_number}
                                    </span>
                                </div>
                                <span
                                    className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border capitalize ${invoice.status === "paid"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : invoice.status === "partially_paid"
                                                ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        }`}
                                >
                                    {invoice.status?.replace(/_/g, " ")}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                    <p className="text-slate-500 mb-1">Total amount</p>
                                    <p className="font-mono text-slate-200 font-semibold">
                                        {formatCurrency(invoice.total_amount)}
                                    </p>
                                </div>
                                <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
                                    <p className="text-slate-500 mb-1">Amount due</p>
                                    <p className="font-mono text-emerald-400 font-semibold">
                                        {formatCurrency(invoice.amount_due)}
                                    </p>
                                </div>
                            </div>

                            {invoice.status !== "paid" && !isDownPayment && (
                                <button
                                    type="button"
                                    onClick={() => setAmount(String(invoice.amount_due))}
                                    className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
                                >
                                    Fill full remaining balance ({formatCurrency(invoice.amount_due)})
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Payment form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Payment type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                            {PAYMENT_TYPES.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={
                                        option.value === "repair_down_payment" &&
                                        isDownPaymentDisabled
                                    }
                                >
                                    {option.label}
                                    {option.value === "repair_down_payment" &&
                                        isDownPaymentDisabled &&
                                        " — unavailable"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Amount
                            {isDownPayment && (
                                <span className="text-emerald-400 font-normal ml-1.5">
                                    (auto-calculated, 30% of total)
                                </span>
                            )}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            readOnly={isDownPayment}
                            placeholder="0.00"
                            className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${isDownPayment
                                    ? "bg-slate-900/40 border-slate-800/60 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-900/70 border-slate-800 text-slate-100 placeholder:text-slate-500"
                                }`}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {isError && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 text-sm"
                            >
                                <XCircle size={16} />
                                {error?.data?.message ||
                                    Object.values(error?.data?.errors ?? {})[0]?.[0] ||
                                    "Something went wrong. Please try again."}
                            </motion.div>
                        )}

                        {isSuccess && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-4 py-3 text-sm"
                            >
                                <CheckCircle2 size={16} />
                                Payment recorded successfully. Redirecting...
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isPending || !invoiceId || !amount}
                        className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-medium px-6 py-3 transition-colors"
                    >
                        {isPending ? "Recording..." : "Record Payment"}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default WalkinPayment;