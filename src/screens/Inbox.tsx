import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import type { NotificationItem, NotificationType } from '@/lib/types'
import { cn } from '@/lib/utils'

const TYPE_ICON: Record<NotificationType, string> = {
  safe: 'Check',
  approaching: 'AlertCircle',
  at_limit: 'AlertTriangle',
  over: 'XCircle',
  pattern: 'Repeat',
  trend: 'TrendingUp',
  positive: 'Sparkles',
  no_spend: 'Flame',
  impulse: 'Zap',
  weekly_summary: 'BarChart3',
  monthly_reset: 'Calendar',
  savings_milestone: 'Target',
}

const TYPE_TINT: Record<NotificationType, string> = {
  safe: 'bg-brand-soft text-[var(--color-brand-strong)]',
  approaching: 'bg-warning-soft text-[#8a6a17]',
  at_limit: 'bg-warning-soft text-[#8a6a17]',
  over: 'bg-alert-soft text-[#9b3338]',
  pattern: 'bg-warning-soft text-[#8a6a17]',
  trend: 'bg-warning-soft text-[#8a6a17]',
  positive: 'bg-brand-soft text-[var(--color-brand-strong)]',
  no_spend: 'bg-brand-soft text-[var(--color-brand-strong)]',
  impulse: 'bg-warning-soft text-[#8a6a17]',
  weekly_summary: 'bg-brand-soft text-[var(--color-brand-strong)]',
  monthly_reset: 'bg-brand-soft text-[var(--color-brand-strong)]',
  savings_milestone: 'bg-brand-soft text-[var(--color-brand-strong)]',
}

export function Inbox() {
  const navigate = useNavigate()
  const { notifications, markAllRead, markNotificationRead } = useAppStore()

  const grouped = groupByDay(notifications)

  return (
    <div className="pb-8">
      <header className="px-5 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-card flex items-center justify-center tap shadow-[var(--shadow-card)]"
          >
            <ArrowLeft size={17} strokeWidth={1.75} />
          </button>
          <h1 className="text-[18px] font-semibold tracking-tight">Updates</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[12px] text-ink font-semibold inline-flex items-center gap-1 tap"
          >
            <CheckCheck size={14} strokeWidth={1.75} />
            Mark all read
          </button>
        )}
      </header>

      <div className="px-5 mt-5 space-y-5">
        {grouped.length === 0 && (
          <Card className="text-center py-10">
            <div className="text-[15px] font-semibold">All caught up</div>
            <div className="text-sm text-soft mt-1">
              You'll see spending updates here.
            </div>
          </Card>
        )}

        {grouped.map((g) => (
          <section key={g.label}>
            <div className="text-[11px] text-soft uppercase tracking-[0.16em] font-semibold px-1 mb-2">
              {g.label}
            </div>
            <div className="space-y-2">
              {g.items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    'w-full text-left bg-card rounded-[20px] p-4 tap flex gap-3 items-start shadow-[var(--shadow-card)] dark:ring-1 dark:ring-[var(--line)]',
                  )}
                >
                  <div
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                      TYPE_TINT[n.type],
                    )}
                  >
                    <Icon name={TYPE_ICON[n.type]} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[14px] font-semibold truncate tracking-tight">
                        {n.title}
                      </div>
                      <div className="text-[11px] text-soft shrink-0 num">
                        {format(new Date(n.createdAt), 'h:mm a')}
                      </div>
                    </div>
                    <div className="text-[13px] text-soft mt-1 leading-relaxed">
                      {n.body}
                    </div>
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-ink mt-1.5 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function groupByDay(notifications: NotificationItem[]) {
  const sorted = [...notifications].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  )
  const groups: { label: string; items: NotificationItem[] }[] = []
  for (const n of sorted) {
    const label = format(new Date(n.createdAt), 'EEE, MMM d')
    const existing = groups.find((g) => g.label === label)
    if (existing) existing.items.push(n)
    else groups.push({ label, items: [n] })
  }
  return groups
}
