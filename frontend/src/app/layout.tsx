import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NextAuthProvider from '../providers/NextAuthProvider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FinEasy | Gestão Descomplicada',
  description: 'Acompanhe suas ações, gere dicas incríveis com IA e gerencie sua vida financeira de forma centralizada.',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary selection:text-primary-foreground">
        <NextAuthProvider>
          <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            {/* Decorative background elements in Green and Yellow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-500/15 blur-[120px] pointer-events-none z-0" />
            
            <div className="z-10 w-full h-full flex flex-col">
              {children}
            </div>
          </main>
        </NextAuthProvider>
      </body>
    </html>
  )
}
