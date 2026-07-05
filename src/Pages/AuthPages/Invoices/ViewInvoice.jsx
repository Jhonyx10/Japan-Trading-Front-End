import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    FileText,
    Loader2,
    AlertCircle,
    Car,
    Wrench,
    CreditCard,
    Calendar,
    Link2,
    GitBranch,
    PlusCircle,
    StickyNote,
} from 'lucide-react'
import { $api } from '../../../api/client'
import AddSupplementalInvoiceModal from '../../../components/modals/AddSupplementalInvoiceModal'

const STATUS_STYLES = {
    unpaid: 'border-amber-900/50 bg-amber-900/20 text-amber-400',
    paid: 'border-green-900/50 bg-green-900/20 text-green-400',
    overdue: 'border-red-900/50 bg-red-900/20 text-red-400',
    partially_paid: 'border-sky-900/50 bg-sky-900/20 text-sky-400',
    partial: 'border-sky-900/50 bg-sky-900/20 text-sky-400',
}

const PAYMENT_STATUS_STYLES = {
    successful: 'border-green-900/50 bg-green-900/20 text-green-400',
    pending: 'border-amber-900/50 bg-amber-900/20 text-amber-400',
    failed: 'border-red-900/50 bg-red-900/20 text-red-400',
}

const formatLabel = (value) =>
    value ? String(value).replace(/_/g, ' ') : '—'

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

const DetailCard = ({ label, value, mono = false, accent = false, className = '' }) => (
    <div className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3">
        <p className="text-slate-500 mb-1 text-[11px]">{label}</p>
        <div
            className={`text-sm ${mono ? 'font-mono' : ''} ${
                accent ? 'text-sky-400 font-semibold' : 'text-slate-200'
            } ${className}`}
        >
            {value}
        </div>
    </div>
)

const ViewInvoice = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showAddModal, setShowAddModal] = useState(false)

    const {
        data: invoice,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => $api(`/invoices/${id}`),
        enabled: Boolean(id),
    })

    const createSupplementalMutation = useMutation({
        mutationFn: (payload) =>
            $api('/invoices', {
                method: 'POST',
                body: payload,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] })
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
    })

    const payments = invoice?.payments ?? []
    const parent = invoice?.parent ?? null
    const children = invoice?.children ?? []
    const vehicle =
        invoice?.repair_job?.vehicle ??
        invoice?.repairJob?.vehicle ??
        invoice?.booking?.vehicle ??
        null

    const statusStyle =
        STATUS_STYLES[invoice?.status] ||
        'border-slate-800 bg-slate-900/40 text-slate-400'

    const isRootInvoice = invoice && !invoice.parent_id

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-6 max-w-5xl mx-auto"
        >
            <button
                type="button"
                onClick={() => navigate('/invoices/contracts')}
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-5 cursor-pointer"
            >
                <ArrowLeft size={16} />
                Back to contracts
            </button>

            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
                    <Loader2 size={28} className="animate-spin text-sky-500" />
                    <span className="text-sm">Loading invoice...</span>
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center gap-4 py-16 px-6 bg-slate-900 border border-slate-800/80 rounded-2xl">
                    <AlertCircle size={32} className="text-red-400" />
                    <p className="text-sm text-slate-400">
                        {error?.message || 'Failed to load invoice.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/invoices/contracts')}
                        className="text-sm text-sky-400 hover:text-sky-300 cursor-pointer"
                    >
                        Return to contracts
                    </button>
                </div>
            )}

            {!isLoading && !isError && invoice && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                                    <FileText size={20} />
                                </span>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Invoice
                                    </p>
                                    <h1 className="text-xl font-semibold text-white font-mono">
                                        {invoice.invoice_number}
                                    </h1>
                                    <p className="text-xs text-slate-500 mt-1">
                                        ID #{invoice.id} · Created {formatDate(invoice.created_at)}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusStyle}`}
                            >
                                {formatLabel(invoice.status)}
                            </span>
                        </div>
                    </div>

                    {parent && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                                <PlusCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-300">
                                        Additional repair invoice
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        This bill covers extra work found during repair that was not
                                        included in the customer&apos;s original services.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate(`/invoices/${parent.id}`)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
                            >
                                <Link2 size={12} />
                                Original: {parent.invoice_number}
                            </button>
                        </div>
                    )}

                    {/* Amount breakdown */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4">Billing Summary</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <DetailCard label="Labor Cost" value={formatCurrency(invoice.labor_cost)} mono />
                            <DetailCard label="Material Cost" value={formatCurrency(invoice.material_cost)} mono />
                            <DetailCard label="Tax" value={formatCurrency(invoice.tax)} mono />
                            <DetailCard label="Total Amount" value={formatCurrency(invoice.total_amount)} mono accent />
                            <DetailCard label="Amount Due" value={formatCurrency(invoice.amount_due)} mono />
                        </div>
                    </div>

                    {/* Invoice details */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4">Details</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <DetailCard label="Type" value={formatLabel(invoice.type)} className="capitalize" />
                            <DetailCard label="Version" value={invoice.version ?? '—'} />
                            <DetailCard label="Authorized At" value={formatDate(invoice.authorized_at)} />
                            <DetailCard
                                label="Parent Invoice"
                                value={
                                    parent ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/invoices/${parent.id}`)}
                                            className="text-sky-400 hover:text-sky-300 cursor-pointer font-mono"
                                        >
                                            {parent.invoice_number}
                                        </button>
                                    ) : (
                                        <span className="text-slate-500">None (original invoice)</span>
                                    )
                                }
                            />
                            <DetailCard
                                label="Repair Job"
                                value={
                                    invoice.repair_job_id ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/repair-job/${invoice.repair_job_id}`)}
                                            className="text-sky-400 hover:text-sky-300 cursor-pointer font-mono normal-case"
                                        >
                                            #{invoice.repair_job_id}
                                        </button>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                            <DetailCard
                                label="Booking"
                                value={invoice.booking_id ? `#${invoice.booking_id}` : '—'}
                                mono
                            />
                            <DetailCard label="Last Updated" value={formatDate(invoice.updated_at)} />
                        </div>

                        {invoice.rejection_reason && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                                <span className="font-semibold">Rejection reason:</span>{' '}
                                {invoice.rejection_reason}
                            </div>
                        )}

                        {invoice.notes && (
                            <div className="mt-4 flex gap-2 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
                                <StickyNote size={14} className="text-slate-500 shrink-0 mt-0.5" />
                                <p>{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Linked add-on invoices */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                    <GitBranch size={15} className="text-indigo-400" />
                                    Additional Work Invoices
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Extra charges when workers discovered repairs beyond the
                                    customer&apos;s availed services.
                                </p>
                            </div>
                            {isRootInvoice && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                                >
                                    <PlusCircle size={15} />
                                    Add Additional Invoice
                                </button>
                            )}
                        </div>

                        {children.length > 0 ? (
                            <div className="overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                                            <th className="py-3 px-4">Invoice</th>
                                            <th className="py-3 px-4">Type</th>
                                            <th className="py-3 px-4 text-right">Total</th>
                                            <th className="py-3 px-4 text-right">Due</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-center w-24">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 text-xs">
                                        {children.map((child) => (
                                            <tr key={child.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="p-4 font-mono text-slate-200">
                                                    {child.invoice_number}
                                                </td>
                                                <td className="p-4 capitalize text-slate-400">
                                                    {formatLabel(child.type)}
                                                </td>
                                                <td className="p-4 text-right font-mono text-slate-200">
                                                    {formatCurrency(child.total_amount)}
                                                </td>
                                                <td className="p-4 text-right font-mono text-amber-400">
                                                    {formatCurrency(child.amount_due)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                                                            STATUS_STYLES[child.status] ||
                                                            'border-slate-800 bg-slate-900/40 text-slate-400'
                                                        }`}
                                                    >
                                                        {formatLabel(child.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/invoices/${child.id}`)}
                                                        className="text-sky-400 hover:text-sky-300 text-[11px] font-medium cursor-pointer"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                                <GitBranch size={20} className="text-slate-700" />
                                <p className="text-xs italic">No additional work invoices yet.</p>
                                {isRootInvoice && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(true)}
                                        className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer mt-1"
                                    >
                                        Create the first add-on invoice
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Related vehicle */}
                    {vehicle && (
                        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                <Car size={15} className="text-slate-500" />
                                Vehicle
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <DetailCard
                                    label="Vehicle"
                                    value={`${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || '—'}
                                />
                                <DetailCard label="Plate" value={vehicle.plate_number ?? '—'} mono />
                                <DetailCard label="Chassis" value={vehicle.chassis_number ?? '—'} mono />
                                <DetailCard label="Body Type" value={formatLabel(vehicle.body_type)} />
                            </div>
                        </div>
                    )}

                    {/* Payment history */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <CreditCard size={15} className="text-slate-500" />
                            Payment History
                        </h2>

                        {payments.length > 0 ? (
                            <div className="overflow-x-auto border border-slate-800/70 rounded-xl bg-slate-950/30">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider bg-slate-900/40">
                                            <th className="py-3 px-4 w-16">ID</th>
                                            <th className="py-3 px-4">Type</th>
                                            <th className="py-3 px-4">Method</th>
                                            <th className="py-3 px-4">Reference</th>
                                            <th className="py-3 px-4 text-right">Amount</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4">Paid At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 text-xs">
                                        {payments.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="hover:bg-slate-800/20 transition-colors"
                                            >
                                                <td className="p-4 font-mono text-slate-500">#{payment.id}</td>
                                                <td className="p-4 capitalize text-slate-300">
                                                    {formatLabel(payment.type)}
                                                </td>
                                                <td className="p-4 text-slate-400">
                                                    {formatLabel(payment.payment_method)}
                                                </td>
                                                <td className="p-4 font-mono text-[10px] text-slate-500 max-w-[140px] truncate">
                                                    {payment.transaction_reference || '—'}
                                                </td>
                                                <td className="p-4 text-right font-mono text-green-400 font-semibold">
                                                    {formatCurrency(payment.amount_paid)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                                                            PAYMENT_STATUS_STYLES[payment.status] ||
                                                            'border-slate-800 bg-slate-900/40 text-slate-400'
                                                        }`}
                                                    >
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-400 text-nowrap">
                                                    {formatDate(payment.paid_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                                <CreditCard size={20} className="text-slate-700" />
                                <p className="text-xs italic">No payments recorded for this invoice.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick links */}
                    <div className="flex flex-wrap gap-2">
                        {invoice.repair_job_id && (
                            <button
                                type="button"
                                onClick={() => navigate(`/repair-job/${invoice.repair_job_id}`)}
                                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                            >
                                <Wrench size={14} />
                                View Repair Job
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate('/invoices/transactions')}
                            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <Calendar size={14} />
                            All Transactions
                        </button>
                    </div>
                </div>
            )}

            {invoice && (
                <AddSupplementalInvoiceModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    parentInvoice={invoice}
                    onSubmit={(payload) => createSupplementalMutation.mutateAsync(payload)}
                />
            )}
        </motion.div>
    )
}

export default ViewInvoice
