import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  Bell,
  ChevronRight,
  Lock,
  RotateCcw,
  Sparkles,
  Sun,
  UserPlus,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Segmented } from '@/components/ui/Segmented'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/Icon'
import type { ThemeMode, ToneMode } from '@/lib/types'

export function Settings() {
  const navigate = useNavigate()
  const {
    user,
    theme,
    setTheme,
    updateUser,
    resetAll,
    loadDemo,
    categories,
  } = useAppStore()
  const [parentSheet, setParentSheet] = useState(false)
  const [privacySheet, setPrivacySheet] = useState(false)
  const [bankSheet, setBankSheet] = useState(false)
  const [muted, setMuted] = useState<Record<string, boolean>>({})

  const parentCode = String(Math.floor(100000 + Math.random() * 900000))

  return (
    <div className="px-5 pt-5 pb-8 space-y-4">
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight">Profile</h1>
      </header>

      <Card>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center text-[15px] font-semibold">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold tracking-tight">{user?.name}</div>
            <div className="text-[12px] text-soft">
              {user?.ageRange}{user?.isStudent ? ' · Student' : ''}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Bell size={16} strokeWidth={1.75} className="text-soft" />
          <h2 className="text-[14px] font-semibold tracking-tight">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-[11px] text-soft uppercase tracking-[0.16em] font-semibold mb-2">
              Tone
            </div>
            <Segmented
              value={(user?.notificationTone ?? 'balanced') as ToneMode}
              onChange={(v) => updateUser({ notificationTone: v })}
              options={[
                { value: 'strict', label: 'Strict' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'chill', label: 'Chill' },
              ]}
              className="w-full"
            />
          </div>
          <div>
            <div className="text-[11px] text-soft uppercase tracking-[0.16em] font-semibold mb-2">
              Mute by category
            </div>
            <div className="space-y-1.5">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-card-2 rounded-xl px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon name={c.icon} size={15} className="text-soft" />
                    <span className="text-[13px] font-medium">{c.name}</span>
                  </div>
                  <Switch
                    checked={!!muted[c.id]}
                    onCheckedChange={(v) => setMuted((m) => ({ ...m, [c.id]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <SettingsRow
        icon={<Banknote size={16} strokeWidth={1.75} />}
        label="Connect a bank"
        sublabel="Pull transactions automatically"
        onClick={() => setBankSheet(true)}
      />

      <SettingsRow
        icon={<UserPlus size={16} strokeWidth={1.75} />}
        label="Invite a parent"
        sublabel="They see a summary — you stay in control"
        onClick={() => setParentSheet(true)}
      />

      <Card>
        <div className="flex items-center gap-3 mb-3">
          <Sun size={16} strokeWidth={1.75} className="text-soft" />
          <h2 className="text-[14px] font-semibold tracking-tight">Appearance</h2>
        </div>
        <Segmented
          value={theme}
          onChange={(v) => setTheme(v as ThemeMode)}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          className="w-full"
        />
      </Card>

      <SettingsRow
        icon={<Lock size={16} strokeWidth={1.75} />}
        label="Your data"
        sublabel="We don't sell it. Ever."
        onClick={() => setPrivacySheet(true)}
      />

      <SettingsRow
        icon={<Sparkles size={16} strokeWidth={1.75} />}
        label="Load demo data"
        sublabel="See the app with Maya's pre-filled account"
        onClick={() => {
          if (confirm("Replace your data with Maya's demo account?")) {
            loadDemo()
            navigate('/')
          }
        }}
      />

      <SettingsRow
        icon={<RotateCcw size={16} strokeWidth={1.75} />}
        label="Start over"
        sublabel="Wipe everything and redo onboarding"
        onClick={() => {
          if (confirm('Wipe all your data and start onboarding again?')) {
            resetAll()
            navigate('/welcome', { replace: true })
          }
        }}
      />

      <Sheet open={parentSheet} onOpenChange={setParentSheet} title="Invite a parent">
        <div className="space-y-4">
          <p className="text-[13px] text-soft leading-relaxed">
            Share this 6-digit code with a parent. They can help set budgets and see a
            summary — but never individual transactions unless you opt in.
          </p>
          <div className="num text-center text-4xl font-bold tracking-[0.4em] bg-card-2 py-6 rounded-2xl">
            {parentCode}
          </div>
          <ul className="text-[12px] text-soft space-y-1.5">
            <li>— You can revoke access anytime</li>
            <li>— You see a log of what they viewed</li>
            <li>— Categories you mark private stay private</li>
          </ul>
          <Button size="lg" onClick={() => setParentSheet(false)}>
            Got it
          </Button>
        </div>
      </Sheet>

      <Sheet open={privacySheet} onOpenChange={setPrivacySheet} title="Your data">
        <ul className="text-[13px] space-y-3 leading-relaxed text-soft">
          <li>— We never sell user data to advertisers.</li>
          <li>— Bank connections are read-only and tokenized via Plaid.</li>
          <li>— Transaction data is encrypted at rest with per-user keys.</li>
          <li>— No ads served to users under 18.</li>
          <li>— You can delete your account and all data in one tap.</li>
        </ul>
        <Button size="lg" className="mt-5" onClick={() => setPrivacySheet(false)}>
          Got it
        </Button>
      </Sheet>

      <Sheet open={bankSheet} onOpenChange={setBankSheet} title="Connect a bank">
        <div className="space-y-2">
          <p className="text-[13px] text-soft mb-2">
            We use Plaid to securely link your bank or card. Read-only, never your password.
          </p>
          {['Chase', 'Bank of America', 'Wells Fargo', 'Capital One', 'Apple Card'].map(
            (b) => (
              <button
                key={b}
                type="button"
                className="w-full flex items-center justify-between bg-card-2 rounded-xl px-4 py-3.5 tap"
              >
                <span className="text-[14px] font-medium">{b}</span>
                <ChevronRight size={15} strokeWidth={1.75} className="text-soft" />
              </button>
            ),
          )}
          <div className="text-[11px] text-soft text-center pt-3">
            (Demo — no real bank will connect.)
          </div>
        </div>
      </Sheet>
    </div>
  )
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-card rounded-[20px] px-4 py-4 flex items-center gap-3 tap text-left shadow-[var(--shadow-card)] dark:ring-1 dark:ring-[var(--line)]"
    >
      <div className="h-10 w-10 rounded-xl bg-card-2 text-ink flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-semibold tracking-tight">{label}</div>
        {sublabel && <div className="text-[12px] text-soft mt-0.5">{sublabel}</div>}
      </div>
      <ChevronRight size={15} strokeWidth={1.75} className="text-soft" />
    </button>
  )
}
