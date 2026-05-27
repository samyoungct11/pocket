import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { TransactionRow } from '@/components/TransactionRow'
import { Icon } from '@/components/Icon'
import {
  categorySpentThisMonth,
  dailyCumulativeForCategory,
  groupTransactionsByDate,
} from '@/lib/selectors'
import { money, statusColor } from '@/lib/utils'

const STATUS_LABEL = {
  green: { label: 'On track', tint: 'bg-brand-soft text-[var(--color-brand-strong)]' },
  amber: { label: 'Getting close', tint: 'bg-warning-soft text-[#8a6a17]' },
  red: { label: 'Over budget', tint: 'bg-alert-soft text-[#9b3338]' },
}

export function CategoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { categories, transactions } = useAppStore()
  const category = categories.find((c) => c.id === id)

  if (!category) {
    return (
      <div className="p-5">
        <button onClick={() => navigate(-1)} className="text-soft text-sm">
          ← Back
        </button>
        <div className="mt-10 text-center text-soft">Category not found.</div>
      </div>
    )
  }

  const now = new Date()
  const spent = categorySpentThisMonth(transactions, category.id, now)
  const pct = spent / category.monthlyBudget
  const status = statusColor(pct)
  const remaining = Math.max(0, category.monthlyBudget - spent)
  const txns = transactions.filter((t) => t.categoryId === category.id)
  const groups = groupTransactionsByDate(txns)

  const chartData = dailyCumulativeForCategory(transactions, category.id, now)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dataWithPace = chartData.map((d) => ({
    ...d,
    pace: (category.monthlyBudget / daysInMonth) * d.day,
  }))

  const avgTxn = txns.length ? txns.reduce((s, t) => s + t.amount, 0) / txns.length : 0
  const biggest = [...txns].sort((a, b) => b.amount - a.amount)[0]

  const chartColor =
    status === 'green' ? '#16965A' : status === 'amber' ? '#D89614' : '#DC4A4A'

  return (
    <div className="pb-8">
      <header className="px-5 pt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-card flex items-center justify-center tap shadow-[var(--shadow-card)]"
          aria-label="Back"
        >
          <ArrowLeft size={17} strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-card-2 text-ink flex items-center justify-center">
            <Icon name={category.icon} size={16} strokeWidth={1.75} />
          </div>
          <h1 className="text-[18px] font-semibold tracking-tight">{category.name}</h1>
        </div>
      </header>

      <div className="px-5 mt-5 space-y-4">
        <Card>
          <div className="display num text-[32px] font-bold">
            {money(spent)}{' '}
            <span className="text-[15px] text-soft font-semibold tracking-tight">
              of {money(category.monthlyBudget)}
            </span>
          </div>
          <div className="num text-[12px] text-soft mt-1">
            {money(remaining)} left this month
          </div>
          <div className="mt-4 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, pct * 100)}%`,
                background: chartColor,
              }}
            />
          </div>
          <span
            className={[
              'inline-block mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full',
              STATUS_LABEL[status].tint,
            ].join(' ')}
          >
            {STATUS_LABEL[status].label}
          </span>
        </Card>

        <Card>
          <h3 className="text-[12px] font-semibold tracking-tight uppercase text-soft mb-3">
            Spending this month
          </h3>
          <div className="h-44 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataWithPace} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="catFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="day" stroke="var(--soft)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--soft)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <ReferenceLine
                  y={category.monthlyBudget}
                  stroke="var(--soft)"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Budget',
                    position: 'insideTopRight',
                    fill: 'var(--soft)',
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pace"
                  stroke="var(--soft)"
                  strokeWidth={1}
                  fill="transparent"
                  strokeDasharray="2 3"
                />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke={chartColor}
                  strokeWidth={2.5}
                  fill="url(#catFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="num text-[15px] font-semibold tracking-tight">{money(avgTxn)}</div>
              <div className="text-[11px] text-soft mt-1">Avg / txn</div>
            </div>
            <div>
              <div className="num text-[15px] font-semibold tracking-tight">{txns.length}</div>
              <div className="text-[11px] text-soft mt-1">Transactions</div>
            </div>
            <div>
              <div className="text-[15px] font-semibold truncate tracking-tight">
                {biggest?.merchant ?? '—'}
              </div>
              <div className="text-[11px] text-soft mt-1 num">
                Biggest {biggest ? money(biggest.amount) : ''}
              </div>
            </div>
          </div>
        </Card>

        <section>
          <h3 className="text-[12px] font-semibold tracking-tight uppercase text-soft mb-2 px-1">
            Transactions
          </h3>
          {groups.map((group) => (
            <div key={group.dateKey} className="mb-3">
              <div className="text-[11px] text-soft uppercase tracking-[0.16em] font-semibold px-1 mb-1.5">
                {group.label}
              </div>
              <Card className="py-1 divide-y divide-line">
                {group.items.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    category={category}
                  />
                ))}
              </Card>
            </div>
          ))}
        </section>

        <Link to="/" className="block text-center text-[13px] text-soft pt-2">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
