import AdminSidebar from '@/components/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#1C1C1C' }}>
      <AdminSidebar />
      <main className="min-h-screen lg:ml-[240px] pt-[80px] pb-[72px] px-4 lg:pt-8 lg:pb-8 lg:px-8">
        {children}
      </main>
    </div>
  )
}
