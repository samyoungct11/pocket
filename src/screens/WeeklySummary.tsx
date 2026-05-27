import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/Icon'
import {
  categorySpentThisMonth,
  spentLastWeek,
  spentThisWeek,
} from '@/lib/selectors'
import { money, signedMoney } from '@/lib/utils'

const SLIDE_MS = 5000

export function WeeklySummary() {
  const navigate = useNavigate()
  const { categories, transactions } = useAppStore()
  const [i, setI] = useState(0)

  const now = new Date()
  const thisWeek = spentThisWeek(transactions, now)
  const lastWeek = spentLastWeek(transactions, now)
  const delta = thisWeek - lastWeek
  const topCat = [...categories]
    .map((c) => ({
      ...c,
      spent: categorySpentThisMonth(transactions, c.id, now),
    }))
    .sort((a, b) => b.spent - a.spent)[0]
  const topPct = topCat && thisWeek > 0 ? Math.round((topCat.spent / thisWeek) * 100) : 0

  const slides = [
    {
      bg: 'from-[#0F1115] to-[#1F242C]',
      content: (
        <div className="flex flex-col items-center text-center text-white">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 font-semibold">
            Your week
          </div>
          <div className="display num text-[80px] font-bold leading-none mt-4">
            {money(thisWeek)}
          </div>
          <div className="text-[13px] opacity-80 mt-3">spent over 7 days</div>
        </div>
      ),
    },
    {
      bg: 'from-[#16965A] to-[#0E6F43]',
      content: (
        <div className="flex flex-col items-center text-center text-white">
          {topCat && (
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-4">
              <Icon name={topCat.icon} size={28} strokeWidth={1.75} />
            </div>
          )}
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 font-semibold">
            Biggest category
          </div>
          <div className="text-[36px] font-bold mt-2 tracking-tight">{topCat?.name}</div>
          <div className="text-[13px] opacity-90 mt-2 num">
            {money(topCat?.spent ?? 0)} · {topPct}% of the week
          </div>
        </div>
      ),
    },
    {
      bg: delta > 0 ? 'from-[#DC4A4A] to-[#A03333]' : 'from-[#16965A] to-[#0E6F43]',
      content: (
        <div className="flex flex-col items-center text-center text-white">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 font-semibold">
            vs. last week
          </div>
          <div className="display num text-[80px] font-bold leading-none mt-4">
            {signedMoney(delta)}
          </div>
          <div className="text-[13px] opacity-80 mt-3">
            {delta > 0 ? 'Up this week' : delta < 0 ? 'Down — nice' : 'Even keel'}
          </div>
        </div>
      ),
    },
    {
      bg: 'from-[#0A0C12] to-[#2A2E37]',
      content: (
        <div className="flex flex-col items-center text-center text-white">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-70 font-semibold">
            This week's challenge
          </div>
          <div className="text-[26px] font-bold mt-3 leading-snug tracking-tight max-w-xs">
            Skip one delivery order
          </div>
          <div className="text-[13px] opacity-80 mt-3 max-w-xs leading-relaxed">
            You usually save ~$22 in a week when you cook one extra meal.
          </div>
          <Button
            size="md"
            className="mt-6 w-auto bg-white text-ink hover:bg-white/90"
            onClick={() => navigate('/coach')}
          >
            Accept
          </Button>
        </div>
      ),
    },
  ]

  useEffect(() => {
    const t = setTimeout(() => {
      if (i < slides.length - 1) setI(i + 1)
    }, SLIDE_MS)
    return () => clearTimeout(t)
  }, [i, slides.length])

  const advance = (delta: number) => {
    const next = i + delta
    if (next < 0) return
    if (next >= slides.length) {
      navigate('/')
      return
    }
    setI(next)
  }

  return (
    <div className="absolute inset-0 z-50 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[i].bg} transition-colors`} />

      <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
        {slides.map((_, idx) => (
          <div key={idx} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
            {idx < i && <div className="h-full w-full bg-white" />}
            {idx === i && (
              <motion.div
                key={i}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
                className="h-full bg-white"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-7 right-4 z-10 h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white tap"
        aria-label="Close"
      >
        <X size={17} strokeWidth={1.75} />
      </button>

      <button
        type="button"
        onClick={() => advance(-1)}
        className="absolute top-0 left-0 bottom-0 w-1/3 z-0"
        aria-label="Previous"
      />
      <button
        type="button"
        onClick={() => advance(1)}
        className="absolute top-0 right-0 bottom-0 w-2/3 z-0"
        aria-label="Next"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
          className="relative z-0 h-full flex items-center justify-center px-8 pointer-events-none"
        >
          <div className="pointer-events-auto">{slides[i].content}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
