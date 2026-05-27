import { motion } from 'framer-motion'
import { Coffee, Flame, Repeat, Sparkles, Sun, Wallet } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { subDays } from 'date-fns'
import { money } from '@/lib/utils'
import { useState } from 'react'

export function Coach() {
  const { categories, transactions, challenges, toggleChallenge } = useAppStore()
  const now = new Date()

  const coffeeCat = categories.find((c) => c.name === 'Coffee')
  const coffeeWeek = coffeeCat
    ? transactions.filter(
        (t) =>
          t.categoryId === coffeeCat.id &&
          new Date(t.date) >= subDays(now, 7),
      )
    : []
  const coffeeSpend = coffeeWeek.reduce((s, t) => s + t.amount, 0)

  const subsCat = categories.find((c) => c.name === 'Subscriptions')
  const subs = subsCat
    ? transactions.filter((t) => t.categoryId === subsCat.id)
    : []
  const [subMutes, setSubMutes] = useState<Record<string, boolean>>({})

  return (
    <div className="px-5 pt-5 pb-8 space-y-4">
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight">Coach</h1>
        <p className="text-[13px] text-soft mt-1">
          Patterns we noticed. No lectures.
        </p>
      </header>

      {coffeeCat && (
        <InsightCard
          icon={<Coffee size={17} strokeWidth={1.75} />}
          title="Coffee check-in"
          body={`You've bought coffee ${coffeeWeek.length} of the last 7 days. ${money(coffeeSpend)} total — that's ${money(coffeeSpend * 4.3)}/month at this pace.`}
          action="Set a coffee cap"
        />
      )}

      {subs.length > 0 && (
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-card-2 text-ink flex items-center justify-center shrink-0">
              <Repeat size={17} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold tracking-tight">
                Subscription review
              </div>
              <div className="text-[12px] text-soft mt-0.5 num">
                {subs.length} active · {money(subs.reduce((s, t) => s + t.amount, 0))}/mo
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {subs.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between bg-card-2 rounded-xl px-3.5 py-3"
              >
                <div>
                  <div className="text-[13px] font-semibold">{s.merchant}</div>
                  <div className="num text-[11px] text-soft">{money(s.amount)}/mo</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-soft uppercase tracking-wide">
                    {subMutes[s.id] ? 'Unused' : 'Keep'}
                  </span>
                  <Switch
                    checked={!!subMutes[s.id]}
                    onCheckedChange={(v) =>
                      setSubMutes((m) => ({ ...m, [s.id]: v }))
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <InsightCard
        icon={<Sun size={17} strokeWidth={1.75} />}
        title="Weekend pattern"
        body="You spend 2.4× more on weekends than weekdays. Mostly food."
        action="Try a no-delivery weekend"
      />

      <InsightCard
        icon={<Sparkles size={17} strokeWidth={1.75} />}
        title="Recent wins"
        body="No impulse shopping in 8 days. That's a record this month."
      />

      <section>
        <h2 className="text-[13px] font-semibold tracking-tight uppercase text-soft mt-2 mb-2">
          Challenges
        </h2>
        {challenges.length === 0 && (
          <Card className="text-center py-6">
            <div className="text-sm text-soft">No challenges yet.</div>
          </Card>
        )}
        {challenges.map((c) => (
          <Card key={c.id} className="mb-2">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-card-2 text-ink flex items-center justify-center shrink-0">
                <Flame size={17} strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold tracking-tight">
                  {c.title}
                </div>
                <div className="text-[13px] text-soft mt-1 leading-relaxed">
                  {c.description}
                </div>
                <Button
                  size="sm"
                  variant={c.active ? 'secondary' : 'primary'}
                  className="mt-3"
                  onClick={() => toggleChallenge(c.id)}
                >
                  {c.active ? 'Active · Tap to end' : 'Accept challenge'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-[13px] font-semibold tracking-tight uppercase text-soft mt-2 mb-2">
          Streaks
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <StreakTile icon={<Flame size={16} strokeWidth={1.75} />} label="Under budget" value="2w" />
          <StreakTile icon={<Coffee size={16} strokeWidth={1.75} />} label="No coffee" value="1d" />
          <StreakTile icon={<Wallet size={16} strokeWidth={1.75} />} label="No spend" value="3d" />
        </div>
      </section>
    </div>
  )
}

function InsightCard({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body: string
  action?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-card-2 text-ink flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold tracking-tight">
              {title}
            </div>
            <div className="text-[13px] text-soft mt-1 leading-relaxed">{body}</div>
            {action && (
              <Button size="sm" variant="secondary" className="mt-3">
                {action}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function StreakTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-card rounded-[18px] p-4 shadow-[var(--shadow-card)] dark:ring-1 dark:ring-[var(--line)]">
      <div className="text-soft">{icon}</div>
      <div className="num text-[18px] font-semibold mt-2 tracking-tight">{value}</div>
      <div className="text-[11px] text-soft mt-0.5 leading-tight">{label}</div>
    </div>
  )
}
