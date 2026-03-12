import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: '\u667A\u80FD\u552E\u540E\u5BA2\u670D - \u60A8\u7684\u8D34\u5FC3\u8D2D\u7269\u52A9\u624B',
  description: '\u7535\u5546\u552E\u540E\u667A\u80FD\u5BA2\u670D\u7CFB\u7EDF\uFF0C\u63D0\u4F9B\u9000\u6362\u8D27\u3001\u7269\u6D41\u67E5\u8BE2\u3001\u552E\u540E\u54A8\u8BE2\u7B49\u4E00\u7AD9\u5F0F\u670D\u52A1',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#4a6cf7',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
