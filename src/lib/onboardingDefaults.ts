import type { Category, NotificationItem } from '@/lib/types'
import { uid } from '@/lib/utils'

/** Default icons + weights for the 12 onboarding category choices. */
export const CATEGORY_DEFAULTS: Record<
  string,
  { icon: string; weight: number }
> = {
  Restaurants:   { icon: 'UtensilsCrossed', weight: 4 },
  Coffee:        { icon: 'Coffee',          weight: 1 },
  Shopping:      { icon: 'ShoppingBag',     weight: 2 },
  Fun:           { icon: 'Ticket',          weight: 2 },
  Subscriptions: { icon: 'Repeat',          weight: 1 },
  Transport:     { icon: 'Car',             weight: 1.5 },
  Beauty:        { icon: 'Sparkles',        weight: 1.5 },
  Gaming:        { icon: 'Gamepad2',        weight: 1 },
  School:        { icon: 'GraduationCap',   weight: 1 },
  Sports:        { icon: 'Trophy',          weight: 1 },
  Gifts:         { icon: 'Gift',            weight: 0.5 },
  Other:         { icon: 'Layers',          weight: 1 },
}

export const ONBOARDING_CATEGORIES = Object.keys(CATEGORY_DEFAULTS)

/**
 * Given picked category names + monthly income, generate Category records
 * with sensible budgets. Reserves 10% of income as buffer (savings/unallocated).
 * Each budget rounded to nearest $5, min $10.
 */
export function generateCategories(
  picked: string[],
  income: number,
): Category[] {
  const totalWeight = picked.reduce(
    (s, name) => s + (CATEGORY_DEFAULTS[name]?.weight ?? 1),
    0,
  )
  const spendable = Math.max(0, income) * 0.9
  return picked.map((name) => {
    const def = CATEGORY_DEFAULTS[name] ?? { icon: 'Layers', weight: 1 }
    const raw = totalWeight > 0 ? (def.weight / totalWeight) * spendable : 0
    const budget = Math.max(10, Math.round(raw / 5) * 5)
    return {
      id: uid(),
      name,
      icon: def.icon,
      monthlyBudget: budget,
    }
  })
}

/** A welcoming first notification so the inbox isn't empty. */
export function buildWelcomeNotification(totalBudget: number): NotificationItem {
  return {
    id: uid(),
    type: 'monthly_reset',
    title: 'Welcome to Curb',
    body: `$${totalBudget} budgeted across your categories. Tap + on Activity to log your first spend.`,
    read: false,
    createdAt: new Date().toISOString(),
  }
}
