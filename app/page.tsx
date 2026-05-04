import Image from 'next/image'
import Link from 'next/link'
import BookingButton from '@/components/landing/booking-button'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8' }}>
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(250,250,248,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(28,28,28,0.07)' }}>
        <Image src="/Logo.png" alt="MUTE EYELASH SALON" width={110} height={38} className="h-8 w-auto object-contain" />
        <div className="flex items-center gap-3">
          <Link href="/login" className="h-9 px-5 rounded-lg text-sm font-medium flex items-center transition-colors"
            style={{ color: '#2D4A3E', border: '1.5px solid rgba(45,74,62,0.2)' }}>
            로그인
          </Link>
          <BookingButton />
        </div>
      </header>

      {/* 히어로 */}
      <section className="pt-16 min-h-screen flex items-center" style={{ background: 'linear-gradient(160deg, #FAFAF8 0%, #F0EDE6 100%)' }}>
        <div className="max-w-5xl mx-auto px-8 py-28 w-full">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: '#2D4A3E' }}>
              MUTE EYELASH SALON · EST. 2023
            </p>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.08] mb-8"
              style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C', letterSpacing: '-0.03em' }}>
              당신의<br />눈빛을<br />완성합니다
            </h1>
            <p className="text-lg mb-10 leading-relaxed" style={{ color: 'rgba(28,28,28,0.55)', maxWidth: '420px' }}>
              속눈썹 펌 전문 살롱 MUTE.<br />
              클래식·볼륨·하이브리드, 당신에게 맞는 스타일을 찾아드립니다.
            </p>
            <div className="flex items-center gap-4">
              <BookingButton size="lg" />
              <Link href="/login" className="h-12 px-8 rounded-xl text-sm font-medium flex items-center transition-colors"
                style={{ color: '#2D4A3E' }}>
                로그인 →
              </Link>
            </div>
            <p className="text-xs mt-5" style={{ color: 'rgba(28,28,28,0.35)' }}>
              Google 계정으로 간편 가입 · 예약 현황 실시간 확인
            </p>
          </div>
        </div>

        {/* 우측 장식 */}
        <div className="hidden lg:block absolute right-0 top-16 bottom-0 w-[40vw] overflow-hidden pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #2D4A3E 0%, #1E3229 100%)' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-10">
            {['LASH', 'PERM', 'CLASSIC', 'VOLUME', 'HYBRID', 'MUTE'].map(w => (
              <span key={w} className="text-6xl font-bold tracking-widest text-white"
                style={{ fontFamily: 'var(--font-playfair,serif)' }}>{w}</span>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Image src="/Logo.png" alt="MUTE" width={160} height={56} className="h-12 w-auto object-contain brightness-0 invert opacity-70 mx-auto mb-4" />
              <p className="text-white/40 text-xs tracking-[0.3em] uppercase">Eyelash Salon</p>
            </div>
          </div>
        </div>
      </section>

      {/* 시술 메뉴 */}
      <section className="py-28 px-8" style={{ background: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: '#2D4A3E' }}>MENU</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C', letterSpacing: '-0.02em' }}>
              시술 메뉴
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '클래식', en: 'Classic', desc: '자연스럽고 깔끔한 1:1 볼륨. 처음 시작하시는 분께 추천드립니다.', price: '60,000', num: '01' },
              { name: '볼륨', en: 'Volume', desc: '가벼운 팬으로 풍성한 볼륨감. 또렷하고 화려한 눈매 연출.', price: '80,000', num: '02' },
              { name: '하이브리드', en: 'Hybrid', desc: '클래식과 볼륨의 완벽한 조화. 자연스러우면서도 풍성한 스타일.', price: '70,000', num: '03' },
            ].map(m => (
              <div key={m.name} className="p-8 rounded-2xl group transition-all hover:-translate-y-1"
                style={{ border: '1.5px solid rgba(28,28,28,0.07)', background: '#FAFAF8' }}>
                <div className="flex items-start justify-between mb-6">
                  <span className="text-xs font-semibold tracking-[0.15em]" style={{ color: 'rgba(28,28,28,0.25)' }}>{m.num}</span>
                  <div className="w-6 h-6 rounded-full" style={{ background: '#2D4A3E', opacity: 0.15 }} />
                </div>
                <p className="text-xs tracking-[0.15em] uppercase mb-1" style={{ color: '#2D4A3E' }}>{m.en}</p>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>{m.name}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(28,28,28,0.5)', minHeight: '60px' }}>{m.desc}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#2D4A3E' }}>{m.price}<span className="text-sm font-normal ml-0.5">원~</span></p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(28,28,28,0.35)' }}>약 2시간</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 px-8" style={{ background: '#FAFAF8' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: '#2D4A3E' }}>HOW IT WORKS</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C', letterSpacing: '-0.02em' }}>
              예약 방법
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '회원가입', desc: 'Google 계정으로 1분 안에 간편하게 가입합니다.' },
              { step: '02', title: '메뉴 & 날짜 선택', desc: '원하는 시술 메뉴와 날짜, 시간을 직접 선택합니다.' },
              { step: '03', title: '예약 확정', desc: '예약 확인 후 연락드립니다. 예약 현황은 앱에서 확인 가능합니다.' },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: '#2D4A3E' }}>{i + 1}</div>
                <div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#1C1C1C' }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(28,28,28,0.5)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-8" style={{ background: '#2D4A3E' }}>
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3 text-white/40">RESERVATION</p>
            <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair,serif)', letterSpacing: '-0.02em' }}>
              지금 예약하기
            </h2>
            <p className="text-base mt-3 text-white/55">Google 계정으로 간편하게 시작하세요.</p>
          </div>
          <BookingButton size="lg" variant="white" />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-10 px-8" style={{ background: '#1C1C1C' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/Logo.png" alt="MUTE" width={80} height={28} className="h-6 w-auto object-contain brightness-0 invert opacity-50" />
          <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>
            © 2023 MUTE EYELASH SALON · All rights reserved ·{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: 'rgba(245,240,232,0.5)' }}>개인정보처리방침</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
