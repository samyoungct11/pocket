import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  Car,
  Check,
  Coffee,
  Equal,
  Flame,
  Gamepad2,
  Gift,
  GraduationCap,
  Hand,
  Home,
  Layers,
  type LucideProps,
  Plane,
  Receipt,
  Repeat,
  ShoppingBag,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Ticket,
  TrendingDown,
  TrendingUp,
  Trophy,
  User as UserIcon,
  UtensilsCrossed,
  Wallet,
  Waves,
  XCircle,
  Zap,
} from 'lucide-react'

/**
 * Registry of every Lucide icon used in the app, looked up by string name.
 * Tree-shakes properly because we import each one explicitly.
 */
const REGISTRY = {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  Car,
  Check,
  Coffee,
  Equal,
  Flame,
  Gamepad2,
  Gift,
  GraduationCap,
  Hand,
  Home,
  Layers,
  Plane,
  Receipt,
  Repeat,
  ShoppingBag,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Ticket,
  TrendingDown,
  TrendingUp,
  Trophy,
  User: UserIcon,
  UtensilsCrossed,
  Wallet,
  Waves,
  XCircle,
  Zap,
} as const

export type IconName = keyof typeof REGISTRY

export function Icon({
  name,
  strokeWidth = 1.75,
  ...props
}: { name: string } & LucideProps) {
  const Cmp = (REGISTRY as Record<string, typeof Layers>)[name] ?? Layers
  return <Cmp strokeWidth={strokeWidth} {...props} />
}
