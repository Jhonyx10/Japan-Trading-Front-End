const btnClass =
    'px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium disabled:opacity-25 disabled:hover:bg-slate-900/60 transition-all cursor-pointer disabled:cursor-not-allowed select-none active:scale-95 disabled:active:scale-100'

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemLabel = 'entries',
    summaryExtra = null,
    className = '',
}) => {
    if (totalItems <= 0) return null

    const indexOfFirstItem = (currentPage - 1) * itemsPerPage
    const indexOfLastItem = currentPage * itemsPerPage
    const safeTotalPages = Math.max(1, totalPages)

    return (
        <div
            className={`flex flex-col sm:flex-row justify-between items-center gap-4 mt-5 pt-4 border-t border-slate-800/60 text-xs text-slate-400 ${className}`}
        >
            <div>
                Showing <span className="text-slate-200 font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="text-slate-200 font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
                <span className="text-slate-200 font-medium">{totalItems}</span> {itemLabel}
                {summaryExtra}
            </div>

            {safeTotalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className={btnClass}
                    >
                        Previous
                    </button>

                    <div className="px-3 text-slate-500 font-mono text-[11px]">
                        Page <span className="text-slate-200">{currentPage}</span> / {safeTotalPages}
                    </div>

                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(currentPage + 1, safeTotalPages))}
                        disabled={currentPage === safeTotalPages}
                        className={btnClass}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default Pagination
