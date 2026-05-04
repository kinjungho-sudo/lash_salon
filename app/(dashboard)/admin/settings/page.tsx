export default function SettingsPage() {
  return (
    <div>
      <h1
        className="text-2xl font-bold text-[#F5F0E8] mb-6"
        style={{ fontFamily: 'var(--font-playfair, serif)' }}
      >
        설정
      </h1>
      <div
        className="rounded-xl p-10 text-center"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Google Calendar 연동은 M2에서 구현 예정</p>
      </div>
    </div>
  )
}
