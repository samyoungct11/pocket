import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AgeRange,
  Category,
  Challenge,
  Contribution,
  NotificationItem,
  PrimaryGoal,
  SavingsGoal,
  ThemeMode,
  ToneMode,
  Transaction,
  User,
} from '@/lib/types'
import {
  seedCategories,
  seedChallenges,
  seedContributions,
  seedGoals,
  seedNotifications,
  seedTransactions,
  seedUser,
} from '@/lib/seed'
import {
  buildWelcomeNotification,
  generateCategories,
} from '@/lib/onboardingDefaults'

export interface AppState {
  user: User | null
  categories: Category[]
  transactions: Transaction[]
  notifications: NotificationItem[]
  goals: SavingsGoal[]
  contributions: Contribution[]
  challenges: Challenge[]
  theme: ThemeMode
  hydrated: boolean

  // user
  setUser: (u: User) => void
  updateUser: (patch: Partial<User>) => void

  // categories
  setCategoryBudget: (id: string, budget: number) => void
  upsertCategory: (c: Category) => void

  // transactions
  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  removeTransaction: (id: string) => void

  // notifications
  addNotification: (n: NotificationItem) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void

  // goals
  addContribution: (goalId: string, amount: number, note?: string) => void
  upsertGoal: (g: SavingsGoal) => void

  // challenges
  toggleChallenge: (id: string) => void

  // theme + lifecycle
  setTheme: (t: ThemeMode) => void
  setHydrated: (v: boolean) => void

  // onboarding / demo
  completeOnboarding: (input: OnboardingInput) => void
  loadDemo: () => void
  resetAll: () => void
}

export interface OnboardingInput {
  name: string
  ageRange: AgeRange
  monthlyIncome: number
  isStudent: boolean
  primaryGoal: PrimaryGoal
  categories: string[]
  notificationTone: ToneMode
}

/** Truly empty state — no user, no data. App routes to /welcome from here. */
const emptyState = () => ({
  user: null as User | null,
  categories: [] as Category[],
  transactions: [] as Transaction[],
  notifications: [] as NotificationItem[],
  goals: [] as SavingsGoal[],
  contributions: [] as Contribution[],
  challenges: [] as Challenge[],
})

/** Maya's pre-populated demo data. */
const demoState = () => ({
  user: seedUser,
  categories: seedCategories,
  transactions: seedTransactions,
  notifications: seedNotifications,
  goals: seedGoals,
  contributions: seedContributions,
  challenges: seedChallenges as Challenge[],
})

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...emptyState(),
      theme: 'system' as ThemeMode,
      hydrated: false,

      setUser: (u) => set({ user: u }),
      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

      setCategoryBudget: (id, budget) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, monthlyBudget: budget } : c,
          ),
        })),
      upsertCategory: (c) =>
        set((s) => {
          const exists = s.categories.some((x) => x.id === c.id)
          return {
            categories: exists
              ? s.categories.map((x) => (x.id === c.id ? c : x))
              : [...s.categories, c],
          }
        }),

      addTransaction: (t) =>
        set((s) => ({ transactions: [t, ...s.transactions] })),
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications] })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      addContribution: (goalId, amount, note) =>
        set((s) => ({
          contributions: [
            {
              id: crypto.randomUUID(),
              goalId,
              amount,
              date: new Date().toISOString(),
              note,
            },
            ...s.contributions,
          ],
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, currentAmount: g.currentAmount + amount }
              : g,
          ),
        })),
      upsertGoal: (g) =>
        set((s) => {
          const exists = s.goals.some((x) => x.id === g.id)
          return {
            goals: exists
              ? s.goals.map((x) => (x.id === g.id ? g : x))
              : [...s.goals, g],
          }
        }),

      toggleChallenge: (id) =>
        set((s) => ({
          challenges: s.challenges.map((c) =>
            c.id === id
              ? {
                  ...c,
                  active: !c.active,
                  startedAt: !c.active
                    ? new Date().toISOString()
                    : c.startedAt,
                }
              : c,
          ),
        })),

      setTheme: (t) => set({ theme: t }),
      setHydrated: (v) => set({ hydrated: v }),

      completeOnboarding: (input) => {
        const categories = generateCategories(input.categories, input.monthlyIncome)
        const totalBudget = categories.reduce((s, c) => s + c.monthlyBudget, 0)
        const user: User = {
          id: crypto.randomUUID(),
          name: input.name || 'You',
          ageRange: input.ageRange,
          monthlyIncome: input.monthlyIncome,
          isStudent: input.isStudent,
          primaryGoal: input.primaryGoal,
          notificationTone: input.notificationTone,
          createdAt: new Date().toISOString(),
        }
        set({
          ...emptyState(),
          user,
          categories,
          notifications: [buildWelcomeNotification(totalBudget)],
          challenges: [
            {
              id: 'ch-starter',
              title: 'Log your first 3 spends',
              description: 'Get a feel for how the coach reacts.',
              active: false,
            },
          ],
        })
      },

      loadDemo: () =>
        set({
          ...demoState(),
          hydrated: true,
        }),

      resetAll: () =>
        set({
          ...emptyState(),
          hydrated: true,
        }),
    }),
    {
      // bumped key — clears any old Maya-seeded state from v1
      name: 'pocket-store-v2',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
