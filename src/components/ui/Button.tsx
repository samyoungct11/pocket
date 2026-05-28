import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold tap select-none transition-colors disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand)] tracking-tight',
  {
    variants: {
      variant: {
        primary:
          'bg-ink text-white hover:opacity-90 dark:bg-white dark:text-ink disabled:bg-[var(--surface-2)] disabled:text-soft',
        brand:
          'bg-brand text-white hover:bg-[var(--color-brand-strong)] disabled:opacity-40',
        secondary:
          'bg-card-2 text-ink hover:bg-[var(--line)] disabled:opacity-40',
        ghost: 'text-ink hover:bg-card-2 disabled:opacity-40',
        danger: 'bg-alert text-white hover:opacity-90 disabled:opacity-40',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px] rounded-full',
        md: 'h-11 px-4 text-[14px] rounded-xl',
        lg: 'h-[52px] px-5 text-[15px] rounded-2xl w-full',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = (asChild ? Slot : 'button') as 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
