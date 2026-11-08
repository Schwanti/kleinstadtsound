import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dj',
  title: 'DJ Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'aliases',
      title: 'Other spellings on flyers',
      description: 'Used to count gigs in the event line-ups, e.g. "DJ Soulstice".',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
    defineField({
      name: 'genres',
      title: 'Genres',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'recentGigs',
      title: 'Recent Gigs',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'soundcloudUrl',
      title: 'SoundCloud URL',
      type: 'url',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
        }),
        defineField({
          name: 'soundcloud',
          title: 'SoundCloud',
          type: 'url',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'photo',
    },
  },
})
