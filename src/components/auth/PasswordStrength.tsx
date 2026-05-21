'use client'

export function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  return score as 0 | 1 | 2 | 3
}

const STRENGTH_CONFIG = [
  { label: '', color: '' },
  { label: 'Débil', color: 'bg-error' },
  { label: 'Media', color: 'bg-warning' },
  { label: 'Fuerte', color: 'bg-success' },
] as const

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getPasswordStrength(password)
  if (!password) return null

  const { label, color } = STRENGTH_CONFIG[strength]

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              strength >= level ? color : 'bg-rim'
            }`}
          />
        ))}
      </div>
      {label && (
        <p
          className={`text-[11px] font-body ${
            strength === 1 ? 'text-error' : strength === 2 ? 'text-warning' : 'text-success'
          }`}
        >
          {label}
        </p>
      )}
    </div>
  )
}
