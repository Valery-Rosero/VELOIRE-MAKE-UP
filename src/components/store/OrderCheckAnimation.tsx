'use client'

import { motion } from 'framer-motion'

export function OrderCheckAnimation() {
  return (
    <div className="flex items-center justify-center mb-6">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          stroke="var(--accent-rose)"
          strokeWidth="2.5"
          fill="var(--bg-highlight)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
        <motion.path
          d="M24 40l11 11 21-22"
          stroke="var(--accent-rose)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}
