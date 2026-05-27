import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Delete,
  Equal,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/Icon'
import {
  categorySpentThisMonth,
  totalBudget,
  totalSpentThisMonth,
} from '@/lib/selectors'
import { cn, money, uid } from '@/lib/utils'
import { logTransaction } from '@/lib/notify'
import type { Transaction } from '@/lib/types'

type Verdict = {
  status: 'green' | 'amber' | 'red'
  headline: string
  detail: string
  tradeoffs: { categoryName: string; cut: number }[]
}

export function AffordCheck() {
  const navigate = useNavigate()
  const { categories, transactions } = useAppStore()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  const value = parseFloat(amount) || 0
  const category = categories.find((c) => c.id === categoryId)

  const calc = () => {
    if (!category || value <= 0) return
    const now = new Date()
    const spent = categorySpentThisMonth(transactions, category.id, now)
    const afterCat = spent + value
    const catRemaining = category.monthlyBudget - afterCat
    const totalAfter = totalSpentThisMonth(transactions, now) + value
    const totalLeft = totalBudget(categories) - totalAfter

    if (catRemaining >= 0) {
      setVerdict({
        status: 'green',
        headline: 'This fits.',
        detail: `You'll have ${money(catRemaining)} left in ${category.name} after this. ${money(totalLeft)} for the month overall.`,
        tradeoffs: [],
      })
      return
    }

    const over = Math.abs(catRemaining)
    const otherRoom = categories
      .filter((c) => c.id !== category.id)
      .map((c) => ({
        name: c.name,
        room: Math.max(0, c.monthlyBudget - categorySpentThisMonth(transactions, c.id, now)),
      }))
      .sort((a, b) => b.room - a.room)

    const tradeoffs: { categoryName: string; cut: number }[] = []
    let needed = over
    for (const c of otherRoom) {
      if (needed <= 0) break
      const take = Math.min(c.room, needed)
      if (take > 0) {
        tradeoffs.push({ categoryName: c.name, cut: Math.round(take) })
        needed -= take
      }
    }

    if (totalLeft < 0) {
      setVerdict({
        status: 'red',
        headline: 'This breaks the month.',
        detail: `This puts ${category.name} ${money(over)} over and your total ${money(Math.abs(totalLeft))} over for the month.`,
        tradeoffs,
      })
    } else {
      setVerdict({
        status: 'amber',
        headline: 'Tight, but doable.',
        detail: `${category.name} would go ${money(over)} over. Here's how to fit it in.`,
        tradeoffs,
      })
    }
  }

  const reset = () => {
    setAmount('')
    setVerdict(null)
  }

  const handleKey = (k: string) => {
    if (verdict) return
    if (k === 'back') {
      setAmount((a) => a.slice(0, -1))
      return
    }
    if (k === '.' && amount.includes('.')) return
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return
    setAmount((a) => (a === '0' && k !== '.' ? k : a + k))
  }

  const verdictStyles = useMemo(() => {
    if (!verdict) return null
    if (verdict.status === 'green')
      return {
        bg: 'bg-brand-soft',
        text: 'text-[var(--color-brand-strong)]',
        Icon: Check,
      }
    if (verdict.status === 'amber')
      return {
        bg: 'bg-warning-soft',
        text: 'text-[#8a6a17]',
        Icon: Equal,
      }
    return {
      bg: 'bg-alert-soft',
      text: 'text-[#9b3338]',
      Icon: AlertTriangle,
    }
  }, [verdict])

  return (
    <div className="flex flex-col h-full px-5 pt-5 pb-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-card flex items-center justify-center tap shadow-[var(--shadow-card)]"
        >
          <ArrowLeft size={17} strokeWidth={1.75} />
        </button>
        <h1 className="text-[18px] font-semibold tracking-tight">Can I afford this?</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center mt-6">
        <div className="text-[11px] text-soft uppercase tracking-[0.2em] font-semibold mb-4">
          Amount
        </div>
        <div className="num display text-[64px] font-bold">
          ${amount || '0'}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar max-w-full px-5 -mx-5">
          {categories.map((c) => {
            const active = c.id === categoryId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id)
                  setVerdict(null)
                }}
                className={cn(
                  'shrink-0 h-10 px-3.5 rounded-full text-[13px] font-semibold tap inline-flex items-center gap-1.5 transition-colors',
                  active
                    ? 'bg-ink text-white dark:bg-white dark:text-ink'
                    : 'bg-card-2 text-ink',
                )}
              >
                <Icon name={c.icon} size={14} strokeWidth={1.75} />
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKey(k)}
            className="h-14 rounded-2xl bg-card text-[20px] font-medium tap flex items-center justify-center shadow-[var(--shadow-card)] dark:ring-1 dark:ring-[var(--line)]"
          >
            {k === 'back' ? <Delete size={18} strokeWidth={1.75} /> : k}
          </button>
        ))}
      </div>

      <Button
        variant="brand"
        size="lg"
        className="mt-4"
        onClick={calc}
        disabled={value <= 0 || !!verdict}
      >
        <Sparkles size={16} strokeWidth={1.75} />
        Check it
      </Button>

      <AnimatePresence>
        {verdict && verdictStyles && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={reset}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[420px] bg-card rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-[var(--shadow-lift)]"
            >
              <div className="flex justify-center -mt-2 mb-3">
                <div className="h-1 w-10 rounded-full bg-[var(--line)]" />
              </div>
              <div className={cn('rounded-2xl p-6 text-center', verdictStyles.bg)}>
                <div
                  className={cn(
                    'h-12 w-12 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center mx-auto mb-3',
                    verdictStyles.text,
                  )}
                >
                  <verdictStyles.Icon size={22} strokeWidth={2} />
                </div>
                <div
                  className={cn(
                    'text-[20px] font-semibold tracking-tight',
                    verdictStyles.text,
                  )}
                >
                  {verdict.headline}
                </div>
                <div
                  className={cn(
                    'text-[13px] mt-2 leading-relaxed',
                    verdictStyles.text,
                    'opacity-90',
                  )}
                >
                  {verdict.detail}
                </div>
              </div>

              {verdict.tradeoffs.length > 0 && <Tradeoffs items={verdict.tradeoffs} />}

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="secondary" size="md" onClick={reset}>
                  Maybe later
                </Button>
                <Button
                  size="md"
                  onClick={() => {
                    const txn: Transaction = {
                      id: uid(),
                      merchant: 'Manual entry',
                      amount: value,
                      categoryId,
                      date: new Date().toISOString(),
                      isManual: true,
                    }
                    logTransaction(txn)
                    reset()
                    navigate('/transactions')
                  }}
                >
                  Log this purchase
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function Tradeoffs({ items }: { items: { categoryName: string; cut: number }[] }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mt-3 bg-card-2 rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 tap"
      >
        <span className="text-[13px] font-semibold">How to make it work</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={cn('transition-transform text-soft', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-3 space-y-1.5">
              {items.map((t) => (
                <li
                  key={t.categoryName}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="text-soft">Cut from {t.categoryName}</span>
                  <span className="num font-semibold">−${t.cut}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
