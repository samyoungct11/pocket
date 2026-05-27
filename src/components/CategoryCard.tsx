import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/Icon'
import type { Category } from '@/lib/types'
import { cn, money, statusColor } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  spent: number
  variant?: 'horizontal' | 'full'
  index?: number
}

const BAR_COLOR = {
  green: 'bg-[var(--color-brand)]',
  amber: 'bg-[var(--color-warning)]',
  red: 'bg-[var(--color-alert)]',
}

export function CategoryCard({
  category,
  spent,
  variant = 'horizontal',
  index = 0,
}: CategoryCardProps) {
  const pct = Math.min(1, spent / category.monthlyBudget)
  const status = statusColor(pct)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={variant === 'horizontal' ? 'shrink-0 w-[152px]' : 'w-full'}
    >
      <Link
        to={`/category/${category.id}`}
        className="block bg-card rounded-[20px] p-4 tap shadow-[var(--shadow-card)]"
      >
        <div className="h-9 w-9 rounded-xl bg-card-2 flex items-center justify-center mb-3">
          <Icon name={category.icon} size={17} className="text-ink" />
        </div>
        <div className="text-[13px] font-semibold text-ink truncate">
          {category.name}
        </div>
        <div className="num text-[11px] text-soft mt-0.5">
          {money(spent)} of {money(category.monthlyBudget)}
        </div>
        <div className="mt-3 h-1 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', BAR_COLOR[status])}
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 + index * 0.04 }}
          />
        </div>
      </Link>
    </motion.div>
  )
}
