# Sanity Agent

## Purpose
Manages Sanity CMS setup, schema definitions, queries, and content management for the Kleinstadtsound website.

## Responsibilities
- Set up Sanity project and configuration
- Define content schemas (DJ Profile, Event)
- Create GROQ queries for fetching content
- Manage Sanity Studio customization
- Handle image assets and references

## Content Schemas

### DJ Profile
```javascript
{
  name: 'dj',
  title: 'DJ Profile',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'slug', source: 'name' },
    { name: 'photo', type: 'image', options: { hotspot: true } },
    { name: 'bio', type: 'text' },
    { name: 'genres', type: 'array', of: [{ type: 'string' }] },
    { name: 'recentGigs', type: 'array', of: [{ type: 'string' }] },
    { name: 'soundcloudUrl', type: 'url' },
    { name: 'socialLinks', type: 'object', fields: [
      { name: 'instagram', type: 'url' },
      { name: 'soundcloud', type: 'url' }
    ]}
  ]
}
```

### Event
```javascript
{
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'date', type: 'date' },
    { name: 'type', type: 'string', options: {
      list: [
        { title: 'Organized', value: 'organized' },
        { title: 'Guest Appearance', value: 'guest' }
      ]
    }},
    { name: 'location', type: 'string' },
    { name: 'description', type: 'text' },
    { name: 'link', type: 'url' },
    { name: 'image', type: 'image', options: { hotspot: true } }
  ]
}
```

## Key Queries
- Fetch all DJs: `*[_type == "dj"]`
- Fetch all events: `*[_type == "event"] | order(date desc)`
- Fetch event by type: `*[_type == "event" && type == $type]`

## Guidelines
- Always use Sanity client for data fetching
- Optimize images with Sanity image URLs
- Use preview mode for draft content
- Keep schemas minimal and focused
