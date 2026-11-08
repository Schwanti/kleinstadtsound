/**
 * Copies the crew (src/content/crew.ts) and the event archive (src/content/events.ts),
 * flyers included, into the Sanity dataset.
 *
 *   npm run sanity:import -- --dry-run   show what would be written, change nothing
 *   npm run sanity:import                write to Sanity
 *
 * Needs in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET (optional, default "production")
 *   SANITY_API_WRITE_TOKEN  a token with Editor rights (sanity.io/manage > API > Tokens)
 *
 * Safe to run again: documents get fixed ids (dj-<name>, event-<id>) and are replaced,
 * identical images are stored once by Sanity. Documents that were not created by this
 * script (e.g. test entries made in the Studio) are listed at the end, never deleted.
 */
import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { createClient } from '@sanity/client'
import { crew } from '../src/content/crew'
import { events } from '../src/content/events'

const root = join(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

// Minimal .env.local reader, so the script runs without extra packages or flags.
function loadEnvFile(file: string) {
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]] !== undefined) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}
loadEnvFile(join(root, '.env.local'))
loadEnvFile(join(root, '.env'))

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID fehlt in .env.local.')
  process.exit(1)
}
if (!token && !dryRun) {
  console.error(
    'SANITY_API_WRITE_TOKEN fehlt in .env.local.\n' +
      'Anlegen unter sanity.io/manage > Projekt > API > Tokens > "Add API token" (Rechte: Editor).',
  )
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function uploadFlyer(publicPath: string) {
  const file = join(root, 'public', publicPath)
  if (!existsSync(file)) {
    console.warn(`  Flyer nicht gefunden: ${publicPath}`)
    return undefined
  }
  if (dryRun) return { _type: 'image', asset: { _type: 'reference', _ref: `(upload ${basename(file)})` } }
  const asset = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function main() {
  console.log(`${dryRun ? 'Probelauf' : 'Import'} nach Sanity: Projekt ${projectId}, Dataset ${dataset}\n`)

  const tx = client.transaction()
  const ids = new Set<string>()

  console.log(`Crew (${crew.length})`)
  for (const member of crew) {
    const _id = `dj-${slugify(member.name)}`
    ids.add(_id)
    tx.createOrReplace({
      _id,
      _type: 'dj',
      name: member.name,
      slug: { _type: 'slug', current: slugify(member.name) },
      aliases: member.aliases,
      genres: member.genres,
      soundcloudUrl: member.soundcloud,
      socialLinks: { instagram: member.instagram, soundcloud: member.soundcloud },
    })
    console.log(`  ${member.name}`)
  }

  console.log(`\nEvents (${events.length})`)
  for (const event of events) {
    const _id = `event-${event.id}`
    ids.add(_id)
    const image = event.flyer ? await uploadFlyer(event.flyer) : undefined
    tx.createOrReplace({
      _id,
      _type: 'event',
      title: event.title,
      date: event.date,
      type: event.type,
      location: [event.venue, event.city].filter(Boolean).join(', ') || undefined,
      description: event.info,
      lineup: event.lineup,
      partners: event.partners,
      accent: event.accent,
      image,
    })
    console.log(`  ${event.date}  ${event.title}${image ? '' : '  (ohne Flyer)'}`)
  }

  if (dryRun) {
    console.log('\nProbelauf: nichts geschrieben.')
  } else {
    await tx.commit()
    console.log(`\nFertig: ${ids.size} Dokumente geschrieben.`)
  }

  // Documents the Studio holds that this import did not write.
  if (token) {
    const existing = await client.fetch<{ _id: string; _type: string; title?: string; name?: string }[]>(
      `*[_type in ["dj", "event"] && !(_id in path("drafts.**"))]{_id, _type, title, name}`,
    )
    const others = existing.filter((doc) => !ids.has(doc._id))
    if (others.length) {
      console.log('\nDiese Einträge stammen nicht aus dem Import (z.B. Tests) und erscheinen weiter auf der Seite.')
      console.log('Bei Bedarf im Studio löschen:')
      for (const doc of others) console.log(`  ${doc._type}  ${doc.title ?? doc.name ?? ''}  (${doc._id})`)
    }
  }
}

main().catch((error) => {
  console.error('\nImport fehlgeschlagen:', error.message ?? error)
  process.exit(1)
})
