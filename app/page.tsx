import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8' }}>
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
        <div className="flex items-center gap-2">
          <Image src="/Logo.png" alt="MUTE EYELASH SALON" width={120} height={40} className="h-8 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="h-9 px-5 rounded-lg text-sm font-medium flex items-center transition-colors"
            style={{ color: '#2D4A3E', border: '1.5px solid rgba(45,74,62,0.25)' }}>
            로그인
          </Link>
          <Link href="/signup"
            className="h-9 px-5 rounded-lg text-sm font-semibold flex items-center btn-cream">
            예약하기
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/background.png" alt="MUTE Studio" fill className="object-cover opacity-30" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(250,250,248,0.95) 0%, rgba(250,250,248,0.7) 60%, rgba(45,74,62,0.15) 100%)' }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#2D4A3E' }}>
              MUTE EYELASH SALON · EST. 2023
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C', letterSpacing: '-0.02em' }}>
              당신의 눈빛을<br />완성합니다
            </h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(28,28,28,0.6)' }}>
              속눈썹 펌 전문 살롱 MUTE.<br />
              클래식·볼륨·하이브리드, 당신에게 맞는 스타일을 찾아드립니다.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/signup" className="h-12 px-8 rounded-xl text-sm font-semibold btn-cream flex items-center">
                예약 신청하기
              </Link>
              <Link href="/login" className="h-12 px-8 rounded-xl text-sm font-medium flex items-center transition-colors"
                style={{ color: '#2D4A3E', border: '1.5px solid rgba(45,74,62,0.3)' }}>
                로그인
              </Link>
            </div>
            <p className="text-xs mt-4" style={{ color: 'rgba(28,28,28,0.4)' }}>
              Google 계정으로 간편하게 가입 · 예약 현황 실시간 확인
            </p>
          </div>
          <div className="hidden lg:flex justify-end">
            <div className="relative w-[380px] h-[480px] rounded-3xl overflow-hidden shadow-2xl">
              <Image src="/background.png" alt="MUTE Studio Interior" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 시술 메뉴 */}
      <section className="py-24 px-8" style={{ background: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#2D4A3E' }}>MENU</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C', letterSpacing: '-0.02em' }}>
              시술 메뉴
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '클래식', desc: '자연스럽고 깔끔한 1:1 볼륨. 처음 시작하시는 분께 추천.', price: '60,000' },
              { name: '볼륨', desc: '가벼운 팬으로 풍성한 볼륨감. 또렷하고 화려한 눈매.', price: '80,000' },
              { name: '하이브리드', desc: '클래식과 볼륨의 조화. 자연스러우면서도 풍성한 스타일.', price: '70,000' },
            ].map(m => (
              <div key={m.name} className="p-7 rounded-2xl" style={{ border: '1.5px solid rgba(28,28,28,0.08)', background: '#FAFAF8' }}>
                <div className="w-8 h-0.5 mb-5 rounded" style={{ background: '#2D4A3E' }} />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>{m.name}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(28,28,28,0.55)' }}>{m.desc}</p>
                <p className="text-lg font-semibold" style={{ color: '#2D4A3E' }}>{m.price}원~</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(28,28,28,0.4)' }}>소요시간 약 2시간</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center" style={{ background: '#2D4A3E' }}>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4 text-white/50">RESERVATION</p>
        <h2 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-playfair,serif)' }}>
          지금 예약하기
        </h2>
        <p className="text-base mb-8 text-white/60">간편하게 Google 계정으로 가입하고 원하는 날짜를 선택하세요.</p>
        <Link href="/signup" className="inline-flex items-center h-12 px-10 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.3)' }}>
          예약 신청하기
        </Link>
      </section>

      {/* 푸터 */}
      <footer className="py-10 px-8 text-center" style={{ background: '#1C1C1C' }}>
        <div className="flex justify-center mb-4">
          <Image src="/Logo.png" alt="MUTE" width={80} height={28} className="h-6 w-auto object-contain opacity-60" />
        </div>
        <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>
          © 2023 MUTE EYELASH SALON · All rights reserved ·{' '}
          <Link href="/privacy" className="hover:underline" style={{ color: 'rgba(245,240,232,0.5)' }}>개인정보처리방침</Link>
        </p>
      </footer>
    </div>
  )
}
