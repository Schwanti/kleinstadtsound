// The Kleinstadtsound crew. Edit this list to add or remove members.
// When Sanity is configured (NEXT_PUBLIC_SANITY_PROJECT_ID), the "DJ Profile"
// documents in the Studio replace this list without a code change.

export type CrewMember = {
  name: string
  // Other spellings used on flyers, matched when counting gigs in the archive.
  aliases?: string[]
  genres?: string[]
  instagram?: string
  soundcloud?: string
}

export const crew: CrewMember[] = [
  { name: 'B72' },
  { name: 'GWZ' },
  { name: 'KD' },
  { name: 'Soulstice', aliases: ['DJ Soulstice'] },
  { name: 'Moosi' },
]
