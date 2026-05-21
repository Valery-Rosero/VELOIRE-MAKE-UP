'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const CHAR_LIMIT = 200

interface ProductDescriptionProps {
  description: string
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [expanded, setExpanded] = useState(false)
  const needsExpand = description.length > CHAR_LIMIT

  return (
    <div>
      <AnimatePresence initial={false} mode="wait">
        {expanded || !needsExpand ? (
          <motion.p
            key="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="font-body text-sm text-fg-2 leading-relaxed"
          >
            {description}
          </motion.p>
        ) : (
          <motion.p
            key="truncated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="font-body text-sm text-fg-2 leading-relaxed"
          >
            {description.slice(0, CHAR_LIMIT)}…
          </motion.p>
        )}
      </AnimatePresence>

      {needsExpand && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-xs font-body font-medium text-accent hover:underline underline-offset-4 transition-colors"
        >
          {expanded ? 'Leer menos' : 'Leer más'}
        </button>
      )}
    </div>
  )
}
