import Link from 'next/link'
import CustomerNav from '@/components/layout/customer-nav'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-5 h-14">
        <Link href="/customer" className="font-bold text-gray-900 text-base">MUTE</Link>
        <CustomerNav />
      </header>
      <main className="max-w-xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
