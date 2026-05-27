import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-card rounded-[20px] p-5 shadow-[var(--shadow-card)] dark:ring-1 dark:ring-[var(--line)]',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export function CardHeader({
  title,
  action,
  className,
}: {
  title: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <h3 className="text-[14px] font-semibold text-ink tracking-tight">
        {title}
      </h3>
      {action}
    </div>
  )
}
