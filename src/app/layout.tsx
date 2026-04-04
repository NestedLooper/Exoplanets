import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Exoplanets',
  description: 'Explore confirmed exoplanets from the NASA Archive',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#07071a] text-slate-200`}>
        <nav className="flex items-center gap-4 border-b border-slate-800 px-6 py-4">
          <a href="/" className="text-sm font-bold tracking-widest text-blue-400">EXOPLANETS</a>
          <a href="/map" className="ml-auto text-sm text-slate-500 hover:text-slate-300">Star Map</a>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
