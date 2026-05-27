import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

/** Routes without a bottom tab bar. Still scrollable. */
export function FullScreenLayout() {
  const location = useLocation()
  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18 }}
          className="min-h-full"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
