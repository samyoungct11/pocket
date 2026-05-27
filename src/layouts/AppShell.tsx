import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PhoneFrame } from '@/components/PhoneFrame'
import { useAppStore } from '@/store/useAppStore'

/** Applies theme, redirects to onboarding when no user, wraps phone frame. */
export function AppShell() {
  const theme = useAppStore((s) => s.theme)
  const user = useAppStore((s) => s.user)
  const hydrated = useAppStore((s) => s.hydrated)
  const navigate = useNavigate()
  const location = useLocation()

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const wantDark =
        theme === 'dark' || (theme === 'system' && mql.matches)
      root.classList.toggle('dark', wantDark)
    }
    apply()
    if (theme === 'system') {
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [theme])

  // Redirect to onboarding when there is no user yet
  useEffect(() => {
    if (!hydrated) return
    if (!user && location.pathname !== '/welcome') {
      navigate('/welcome', { replace: true })
    }
  }, [hydrated, user, location.pathname, navigate])

  return (
    <PhoneFrame>
      <Outlet />
    </PhoneFrame>
  )
}
