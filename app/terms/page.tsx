import Link from 'next/link'
import Image from 'next/image'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8' }}>
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(250,250,248,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(28,28,28,0.07)' }}>
        <Link href="/">
          <Image src="/images/logo.png" alt="MUTE EYELASH SALON" width={110} height={38} className="h-8 w-auto object-contain" />
        </Link>
        <Link href="/login" className="h-9 px-5 rounded-lg text-sm font-medium flex items-center transition-colors"
          style={{ color: '#2D4A3E', border: '1.5px solid rgba(45,74,62,0.2)' }}>
          로그인
        </Link>
      </header>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: '#2D4A3E' }}>TERMS OF SERVICE</p>
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C', letterSpacing: '-0.02em' }}>
              이용약관
            </h1>
            <p className="text-sm" style={{ color: 'rgba(28,28,28,0.4)' }}>최종 업데이트: 2026년 5월 4일 · MUTE EYELASH SALON</p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'rgba(28,28,28,0.7)' }}>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제1조 (목적)
              </h2>
              <p>
                본 약관은 MUTE EYELASH SALON(이하 &ldquo;서비스&rdquo;)이 제공하는 온라인 예약 서비스의 이용 조건 및 절차, 서비스 이용자와 서비스 간의 권리·의무 관계를 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제2조 (서비스 이용 자격)
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>본 서비스는 만 14세 이상의 개인만 이용할 수 있습니다.</li>
                <li>이용자는 본 약관에 동의함으로써 서비스 이용 계약이 성립됩니다.</li>
                <li>타인의 정보를 도용하여 가입하는 행위는 엄격히 금지됩니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제3조 (서비스 내용)
              </h2>
              <p className="mb-3">서비스는 다음의 기능을 제공합니다:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>속눈썹 시술(클래식·볼륨·하이브리드) 온라인 예약</li>
                <li>예약 확인 및 취소</li>
                <li>시술 메뉴 및 가격 안내</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제4조 (예약 및 취소 정책)
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>예약은 선착순으로 처리되며, 동일 시간대 중복 예약은 불가합니다.</li>
                <li>예약 취소는 시술 24시간 전까지 가능합니다.</li>
                <li>당일 취소 및 노쇼(no-show)의 경우 차후 예약에 제한이 있을 수 있습니다.</li>
                <li>서비스 제공자의 사정으로 예약이 취소될 경우 즉시 고지합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제5조 (이용자 의무)
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>이용자는 정확한 정보를 제공해야 합니다.</li>
                <li>타인의 개인정보를 도용하거나 서비스를 비정상적으로 이용해서는 안 됩니다.</li>
                <li>서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제6조 (서비스 이용 제한)
              </h2>
              <p>
                서비스는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해하는 경우 사전 통지 없이 이용을 제한하거나 계정을 해지할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제7조 (면책 조항)
              </h2>
              <p>
                서비스는 천재지변, 불가항력적 사유, 이용자의 귀책사유로 인한 서비스 중단에 대해 책임을 지지 않습니다. 서비스는 이용자가 서비스를 통해 기대하는 수익 또는 특정 결과에 대해 보증하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                제8조 (약관 변경)
              </h2>
              <p>
                서비스는 필요한 경우 본 약관을 변경할 수 있으며, 변경 시 서비스 내 공지를 통해 사전에 고지합니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
              </p>
            </section>

            <section className="pt-6" style={{ borderTop: '1px solid rgba(28,28,28,0.1)' }}>
              <div className="p-4 rounded-xl text-xs space-y-1" style={{ background: '#FFFFFF', border: '1px solid rgba(28,28,28,0.08)' }}>
                <p><span className="font-semibold" style={{ color: '#1C1C1C' }}>상호:</span> MUTE EYELASH SALON</p>
                <p><span className="font-semibold" style={{ color: '#1C1C1C' }}>이메일:</span> kinjungho@gmail.com</p>
                <p><span className="font-semibold" style={{ color: '#1C1C1C' }}>시행일:</span> 2026년 5월 4일</p>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center h-10 px-6 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#2D4A3E', border: '1.5px solid rgba(45,74,62,0.2)' }}>
              ← MUTE 홈으로
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-8 px-8" style={{ background: '#1C1C1C' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/images/logo.png" alt="MUTE" width={80} height={28} className="h-6 w-auto object-contain brightness-0 invert opacity-50" />
          <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>
            © 2023 MUTE EYELASH SALON · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
