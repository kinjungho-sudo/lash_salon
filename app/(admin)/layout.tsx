import AdminSidebar from '@/components/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#1C1C1C' }}>
      <AdminSidebar />
      <main className="min-h-screen" style={{ marginLeft: 'var(--sidebar-width)', padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}
