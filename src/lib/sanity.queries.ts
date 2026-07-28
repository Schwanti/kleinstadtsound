import { client } from './sanity'

export interface DJ {
  _id: string
  name: string
  slug: { current: string }
  photo: unknown
  bio: string
  genres: string[]
  recentGigs: string[]
  soundcloudUrl: string
  socialLinks: {
    instagram?: string
    soundcloud?: string
  }
}

export interface Event {
  _id: string
  title: string
  date: string
  type: 'organized' | 'guest'
  location?: string
  description?: string
  link?: string
  image: unknown
}

export async function getDJs(): Promise<DJ[]> {
  return client.fetch(`*[_type == "dj"] | order(name asc)`)
}

export async function getDJBySlug(slug: string): Promise<DJ | null> {
  return client.fetch(`*[_type == "dj" && slug.current == $slug][0]`, { slug })
}

export async function getEvents(): Promise<Event[]> {
  return client.fetch(`*[_type == "event"] | order(date desc)`)
}

export async function getEventsByType(type: 'organized' | 'guest'): Promise<Event[]> {
  return client.fetch(`*[_type == "event" && type == $type] | order(date desc)`, { type })
}
