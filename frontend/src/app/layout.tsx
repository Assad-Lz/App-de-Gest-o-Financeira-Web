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
      <body className="bg-background font-sans antialiased text-slate-200">
        <NextAuthProvider>
          <div className="relative min-h-screen flex flex-col overflow-x-hidden">
            {/* Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none -z-10" />
            
            <main className="flex-1 flex flex-col relative z-0">
              {children}
            </main>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  )
}
