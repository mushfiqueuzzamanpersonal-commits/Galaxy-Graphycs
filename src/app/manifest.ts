import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Galaxy Graphycs',
    short_name: 'Galaxy Graphycs',
    description: 'Premium Printing & Design Services',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
