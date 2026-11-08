// A tiny event bus so the 3D scene can show a message in the page's toast.
export const TOAST_EVENT = 'kss:toast'

export function showToast(text: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: text }))
}
