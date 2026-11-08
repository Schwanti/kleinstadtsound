'use client'

import { useEffect, useState } from 'react'
import { setParty, sceneState } from '@/components/3d/sceneState'
import { TOAST_EVENT } from './toast'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const AWAY_TITLE = 'Komm zurück auf die Tanzfläche'

// The small things: the Konami code party, a note in the console, a tab that calls you back.
export default function EasterEggs() {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    // For whoever opens the developer tools.
    console.log(
      '%cKLEINSTADTSOUND%c\nMit Musik können Menschen nicht unsympathisch sein.\nDu liest Quellcode? Dann komm in die Kellerbar.\nI ♥ Altmühltal.\nTipp: ↑ ↑ ↓ ↓ ← → ← → B A',
      'font: 700 28px Impact, sans-serif; color: #ff001a',
      'font: 13px monospace; color: inherit',
    )

    let progress = 0
    let hideToast: ReturnType<typeof setTimeout> | undefined
    const show = (text: string) => {
      setToast(text)
      clearTimeout(hideToast)
      hideToast = setTimeout(() => setToast(null), 2600)
    }
    const onToast = (e: Event) => show((e as CustomEvent<string>).detail)
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0
      if (progress === KONAMI.length) {
        progress = 0
        setParty(!sceneState.party)
        show(sceneState.party ? 'Party-Modus an' : 'Party-Modus aus')
      }
    }

    const original = document.title
    const onVisibility = () => {
      document.title = document.hidden ? AWAY_TITLE : original
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener(TOAST_EVENT, onToast)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(TOAST_EVENT, onToast)
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(hideToast)
      document.title = original
    }
  }, [])

  return (
    <p className="toast pixel" role="status" aria-live="polite" data-visible={toast ? 'true' : 'false'}>
      {toast}
    </p>
  )
}
