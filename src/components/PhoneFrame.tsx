import { type ReactNode } from 'react'

/**
 * On desktop (>=768px), wraps children in a fixed 420×844 phone-frame mockup.
 * On mobile, fills the viewport.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full bg-app md:bg-[#EAECEF] md:dark:bg-[#0A0C12] md:flex md:flex-col md:items-center md:justify-center md:py-6 md:gap-4">
      <div className="hidden md:block text-[10px] text-soft tracking-[0.2em] uppercase font-medium">
        Preview · open on phone for the real feel
      </div>

      <div
        className={[
          'h-full w-full bg-app overflow-hidden',
          'md:h-[844px] md:w-[420px] md:rounded-[44px]',
          'md:shadow-[0_30px_80px_rgba(15,17,21,0.18),0_8px_24px_rgba(15,17,21,0.06)]',
          'md:ring-1 md:ring-black/5',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
