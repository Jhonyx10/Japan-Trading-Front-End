export const CURRENCY_SYMBOL = '₱'

export const formatCurrency = (value) =>
    `${CURRENCY_SYMBOL}${Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

export const formatPrice = (value) => {
    if (value == null || value === '') return null
    return `${CURRENCY_SYMBOL}${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`
}

export const formatCompact = (value) => {
    const n = Number(value || 0)
    if (n >= 1_000_000) return `${CURRENCY_SYMBOL}${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${CURRENCY_SYMBOL}${(n / 1_000).toFixed(1)}K`
    return formatCurrency(n)
}
