import { motion } from 'framer-motion'
import { $api } from '../../../api/client'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

const AVATAR_COLORS = [
    'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
]

const getInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')

const getAvatarColor = (name = '') => {
    const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const WorkerCardSkeleton = () => (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <span className="absolute inset-x-0 top-0 h-1 bg-slate-700" />

        <div className="flex items-start justify-between">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-700 ring-4 ring-slate-900" />
            <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-slate-800" />
        </div>

        <div className="mt-4 min-w-0 space-y-2">
            <div className="h-3.5 w-28 animate-pulse rounded bg-slate-700" />
            <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 shrink-0 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-36 animate-pulse rounded bg-slate-800" />
            </div>
        </div>
    </div>
)

const Workers = () => {
    const [query, setQuery] = useState('')

    const { data: workers = [], isLoading } = useQuery({
        queryKey: ['workers'],
        queryFn: () => $api('/workers'),
    })

    const filteredWorkers = useMemo(() => {
        if (!query.trim()) return workers
        const q = query.toLowerCase()
        return workers.filter(
            (w) =>
                w.name?.toLowerCase().includes(q) ||
                w.email?.toLowerCase().includes(q) ||
                w.role?.toLowerCase().includes(q)
        )
    }, [workers, query])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-full px-6 py-10"
        >
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Workers
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {isLoading
                            ? 'Loading your team…'
                            : `${filteredWorkers.length} ${filteredWorkers.length === 1 ? 'person' : 'people'}`}
                    </p>
                </div>

                <div className="relative">
                    <svg
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search workers…"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:w-64"
                    />
                </div>
            </div>
            {isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <WorkerCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredWorkers.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-center">
                    <p className="text-sm font-medium text-slate-700">
                        {workers.length === 0 ? 'No workers yet' : 'No matches found'}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                        {workers.length === 0
                            ? 'Workers will appear here once added.'
                            : 'Try a different name, role, or email.'}
                    </p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkers.map((worker, i) => {
                        const accent = getAvatarColor(worker.name)
                        return (
                            <motion.li
                                key={worker.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: i * 0.03 }}
                                whileHover={{ y: -3 }}
                                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <span
                                    className={`absolute inset-x-0 top-0 h-1 ${accent.split(' ')[0]}`}
                                />

                                <div className="flex items-start justify-between">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-slate-900 ${accent}`}
                                    >
                                        {getInitials(worker.name) || '?'}
                                    </div>

                                    {worker?.role?.name && (
                                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                            {worker.role.name}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 min-w-0">
                                    <p className="truncate text-[15px] font-semibold text-slate-900">
                                        {worker.name}
                                    </p>

                                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                                        <svg
                                            className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="truncate">{worker.email}</span>
                                    </div>
                                </div>
                            </motion.li>
                        )
                    })}
                </ul>
            )}
        </motion.div>
    )
}

export default Workers