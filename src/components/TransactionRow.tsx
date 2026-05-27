import { format } from 'date-fns'
import { Icon } from '@/components/Icon'
import type { Category, Transaction } from '@/lib/types'
import { money } from '@/lib/utils'

interface TransactionRowProps {
  transaction: Transaction
  category?: Category
  onClick?: () => void
  showTime?: boolean
}

export function TransactionRow({
  transaction,
  category,
  onClick,
  showTime = true,
}: TransactionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 tap text-left"
    >
      <div className="h-9 w-9 rounded-xl bg-card-2 flex items-center justify-center shrink-0">
        <Icon name={category?.icon ?? 'Wallet'} size={16} className="text-ink" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink truncate">
          {transaction.merchant}
        </div>
        <div className="text-[11px] text-soft">
          {category?.name ?? 'Uncategorized'}
          {showTime && ` · ${format(new Date(transaction.date), 'h:mm a')}`}
        </div>
      </div>
      <div className="num text-[14px] font-semibold text-ink">
        {money(transaction.amount)}
      </div>
    </button>
  )
}
