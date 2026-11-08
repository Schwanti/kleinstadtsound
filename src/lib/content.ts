import { crew as localCrew, type CrewMember } from '@/content/crew'
import { events as localEvents, type ArchiveEvent, type FlyerAccent } from '@/content/events'

// Crew and events come from Sanity when a project is configured,
// otherwise from the local files in src/content/.
const sanityConfigured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)

const ACCENTS: FlyerAccent[] = ['red', 'green', 'magenta', 'cyan', 'blue', 'violet', 'orange', 'chrome']

type SanityDJ = {
  name: string
  genres?: string[]
  socialLinks?: { instagram?: string; soundcloud?: string }
  soundcloudUrl?: string
}

type SanityEvent = {
  _id: string
  title: string
  date: string
  type: 'organized' | 'guest'
  location?: string
  description?: string
  lineup?: string[]
  accent?: string
  image?: unknown
}

export async function getCrew(): Promise<CrewMember[]> {
  if (!sanityConfigured) return localCrew
  try {
    const { client } = await import('./sanity')
    const docs = await client.fetch<SanityDJ[]>(`*[_type == "dj"] | order(name asc){name, genres, socialLinks, soundcloudUrl}`)
    if (!docs?.length) return localCrew
    return docs.map((d) => ({
      name: d.name,
      genres: d.genres,
      instagram: d.socialLinks?.instagram,
      soundcloud: d.soundcloudUrl ?? d.socialLinks?.soundcloud,
    }))
  } catch {
    return localCrew
  }
}

export async function getEvents(): Promise<ArchiveEvent[]> {
  let list = localEvents
  if (sanityConfigured) {
    try {
      const { client, urlFor } = await import('./sanity')
      const docs = await client.fetch<SanityEvent[]>(`*[_type == "event"] | order(date desc)`)
      if (docs?.length) {
        list = docs.map((d) => ({
          id: d._id,
          date: d.date,
          title: d.title,
          venue: d.location,
          lineup: d.lineup ?? [],
          info: d.description,
          type: d.type,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          flyer: d.image ? urlFor(d.image as any).width(1000).url() : undefined,
          accent: ACCENTS.includes(d.accent as FlyerAccent) ? (d.accent as FlyerAccent) : 'red',
        }))
      }
    } catch {
      list = localEvents
    }
  }
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
}

// How often a crew member appears in the archive's line-ups (b2b and x pairings included).
export function gigCount(member: CrewMember, archive: ArchiveEvent[]) {
  const names = [member.name, ...(member.aliases ?? [])].map((n) => n.toLowerCase())
  const pattern = new RegExp(`(^|[^a-z0-9])(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})($|[^a-z0-9])`, 'i')
  return archive.filter((e) => e.lineup.some((slot) => pattern.test(slot.toLowerCase()))).length
}
