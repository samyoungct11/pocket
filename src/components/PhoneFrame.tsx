import { type ReactNode } from 'react'

/**
 * On desktop (>=768px), wraps children in a fixed 420×844 phone-frame mockup.
 * On mobile, fills the viewport and lets the inner layout manage scroll.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full bg-app md:bg-[#EDEEF1] md:dark:bg-[#0A0C10] md:flex md:flex-col md:items-center md:justify-center md:py-6 md:gap-3">
      {/* Desktop caption */}
      <div className="hidden md:block text-xs text-soft tracking-wide uppercase">
        📱 Preview · open on your phone for the real feel
      </div>

      <div
        className={[
          // Mobile: fill viewport, no clipping, child handles scroll
          'h-full w-full bg-app overflow-hidden',
          // Desktop: fixed phone-shaped frame with rounded corners + shadow
          'md:h-[844px] md:w-[420px] md:rounded-[44px] md:border md:border-[var(--line)] md:shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
