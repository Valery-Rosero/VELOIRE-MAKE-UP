'use client'

import { useState, useTransition } from 'react'

type ActionResult = { error: string } | null | undefined | void

export function useConfirmAction(
  action: () => Promise<ActionResult>,
  onSuccess: () => void
) {
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function open() {
    setError(null)
    setShowModal(true)
  }

  function close() {
    if (!isPending) setShowModal(false)
  }

  function confirm() {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result && 'error' in result) {
        setError(result.error)
      } else {
        setShowModal(false)
        onSuccess()
      }
    })
  }

  return { showModal, isPending, error, setError, open, close, confirm }
}
