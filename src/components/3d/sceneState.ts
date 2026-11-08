// Shared, mutable state between the page and the 3D scene. Read inside useFrame,
// written by click handlers and the Konami listener; no React re-render needed.
export const sceneState = {
  // false while the tonearm is lifted: the town stops dancing, the lights dim.
  playing: true,
  // the Konami code toggles it.
  party: false,
  // -2 when the figure's head is clicked, then the clock time the jump started.
  jumpAt: -1,
}

export function setParty(on: boolean) {
  sceneState.party = on
  if (typeof document !== 'undefined') document.documentElement.dataset.party = on ? 'true' : 'false'
}
