import Image from 'next/image'
import Link from 'next/link'
import CustomerNav from '@/components/layout/customer-nav'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8' }}>
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 h-14"
        style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
        <Link href="/customer">
          <Image src="/Logo.png" alt="MUTE EYELASH SALON" width={100} height={34} className="h-7 w-auto object-contain" />
        </Link>
        <CustomerNav />
      </header>

      {/* 콘텐츠 */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-2xl mx-auto px-5 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
