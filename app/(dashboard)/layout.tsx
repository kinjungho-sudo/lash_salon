import Sidebar from '@/components/layout/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main
        className="min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width)', padding: '32px' }}
      >
        {children}
      </main>
    </div>
  )
}
