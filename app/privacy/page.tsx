import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8' }}>
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(250,250,248,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(28,28,28,0.07)' }}>
        <Link href="/">
          <Image src="/Logo.png" alt="MUTE EYELASH SALON" width={110} height={38} className="h-8 w-auto object-contain" />
        </Link>
        <Link href="/login" className="h-9 px-5 rounded-lg text-sm font-medium flex items-center transition-colors"
          style={{ color: '#2D4A3E', border: '1.5px solid rgba(45,74,62,0.2)' }}>
          로그인
        </Link>
      </header>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* 타이틀 */}
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: '#2D4A3E' }}>PRIVACY POLICY</p>
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C', letterSpacing: '-0.02em' }}>
              개인정보처리방침
            </h1>
            <p className="text-sm" style={{ color: 'rgba(28,28,28,0.4)' }}>최종 업데이트: 2026년 5월 4일 · MUTE EYELASH SALON</p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'rgba(28,28,28,0.7)' }}>

            {/* 게이트 1: 수집 항목·목적·보유기간 */}
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                1. 수집하는 개인정보 항목, 목적, 보유기간
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: '#F0EDE6' }}>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>구분</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>수집 항목</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>수집·이용 목적</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>보유기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { category: '필수', items: '이메일 주소', purpose: '계정 인증, 서비스 이용', retention: '탈퇴 시 즉시 삭제' },
                      { category: '필수', items: '이름, 연락처', purpose: '예약 관리 및 고객 식별', retention: '탈퇴 시 즉시 삭제' },
                      { category: '필수', items: '거주 동네(동 이름, 좌표)', purpose: '마케팅 지역 분석', retention: '탈퇴 시 즉시 삭제' },
                      { category: '선택', items: '메모', purpose: '시술 이력·특이사항 기록', retention: '탈퇴 시 즉시 삭제' },
                      { category: '선택', items: '마케팅 수신 동의 여부', purpose: '프로모션 안내 발송', retention: '동의 철회 시 즉시 삭제' },
                      { category: '자동수집', items: '서비스 이용 기록(예약 내역)', purpose: '서비스 품질 개선', retention: '탈퇴 후 3년 (관련 법령)' },
                    ].map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8' }}>
                        <td className="px-4 py-3" style={{ border: '1px solid rgba(28,28,28,0.08)', color: row.category === '필수' ? '#DC2626' : 'rgba(28,28,28,0.5)', fontWeight: row.category === '필수' ? 600 : 400 }}>{row.category}</td>
                        <td className="px-4 py-3" style={{ border: '1px solid rgba(28,28,28,0.08)' }}>{row.items}</td>
                        <td className="px-4 py-3" style={{ border: '1px solid rgba(28,28,28,0.08)' }}>{row.purpose}</td>
                        <td className="px-4 py-3" style={{ border: '1px solid rgba(28,28,28,0.08)' }}>{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs" style={{ color: 'rgba(28,28,28,0.45)' }}>
                * 필수 항목에 동의하지 않으면 서비스 이용이 제한될 수 있습니다.
              </p>
            </section>

            {/* 게이트 2: 동의 (회원가입 페이지에서 처리 — 여기서는 안내만) */}
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                2. 개인정보 수집에 대한 동의
              </h2>
              <p>회원가입 시 본 처리방침 및 이용약관에 대한 동의 여부를 개별적으로 선택할 수 있습니다.</p>
              <ul className="list-disc pl-5 mt-3 space-y-1.5">
                <li><span className="font-semibold" style={{ color: '#DC2626' }}>[필수]</span> 이용약관 및 개인정보처리방침 동의 — 미동의 시 서비스 이용 불가</li>
                <li><span className="font-medium" style={{ color: 'rgba(28,28,28,0.5)' }}>[선택]</span> 마케팅 정보 수신 동의 — 미동의 시에도 서비스 이용 가능</li>
              </ul>
              <p className="mt-3">
                동의 철회는 서비스 내 설정 또는 아래 연락처로 요청할 수 있으며, 철회 즉시 처리됩니다.
              </p>
            </section>

            {/* 게이트 3: 만 14세 미만 차단 */}
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                3. 만 14세 미만 아동 이용 제한
              </h2>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}>
                <p className="font-semibold mb-2" style={{ color: '#DC2626' }}>본 서비스는 만 14세 미만 아동의 회원가입 및 개인정보 수집을 금지합니다.</p>
                <p style={{ color: 'rgba(28,28,28,0.6)' }}>
                  개인정보 보호법 제22조에 따라, 만 14세 미만 아동의 개인정보를 처리하려면 법정대리인의 동의가 필요합니다.
                  본 서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만임이 확인된 경우 즉시 계정을 삭제합니다.
                </p>
              </div>
            </section>

            {/* 게이트 4: 처리방침 별도 페이지 (현재 페이지가 그 역할) */}
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                4. 개인정보처리방침의 공개
              </h2>
              <p>
                본 처리방침은 서비스 초기 화면({' '}
                <Link href="/" className="font-medium hover:underline" style={{ color: '#2D4A3E' }}>lash-salon-rosy.vercel.app</Link>
                {' '}) 하단 및 회원가입 화면에서 쉽게 확인할 수 있도록 공개하고 있습니다.
                처리방침이 변경될 경우 서비스 내 공지사항을 통해 사전 고지합니다.
              </p>
            </section>

            {/* 게이트 5: 위탁·제3자 제공 */}
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                5. 개인정보 처리 위탁 및 제3자 제공
              </h2>
              <p className="mb-4">서비스 운영을 위해 아래 업체에 개인정보 처리를 위탁합니다. 위탁받은 업체는 위탁 목적 외의 용도로 개인정보를 처리하지 않습니다.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: '#F0EDE6' }}>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>수탁업체</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>위탁 업무</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>국가</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1C1C1C', border: '1px solid rgba(28,28,28,0.1)' }}>보유기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { company: 'Supabase Inc.', work: '데이터베이스 저장·인증 서비스', country: '미국', retention: '위탁 계약 종료 시' },
                      { company: 'Vercel Inc.', work: '서버 호스팅 및 CDN', country: '미국', retention: '위탁 계약 종료 시' },
                      { company: 'Google LLC', work: 'OAuth 인증, 캘린더 API 연동', country: '미국', retention: '위탁 계약 종료 시' },
                      { company: 'Kakao Corp.', work: '지도 표시, 주소 검색 API', country: '대한민국', retention: '위탁 계약 종료 시' },
                      { company: 'NAVER Corp.', work: '검색 트렌드 데이터 API', country: '대한민국', retention: '위탁 계약 종료 시' },
                    ].map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8' }}>
                        <td className="px-4 py-3 font-medium" style={{ border: '1px solid rgba(28,28,28,0.08)', color: '#1C1C1C' }}>{row.company}</td>
                        <td className="px-4 py-3" style={{ border: '1px solid rgba(28,28,28,0.08)' }}>{row.work}</td>
                        <td className="px-4 py-3" style={{ border: '1px solid rgba(28,28,28,0.08)' }}>{row.country}</td>
                        <td className="px-4 py-3" style={{ border: '1px solid rgba(28,28,28,0.08)' }}>{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs" style={{ color: 'rgba(28,28,28,0.45)' }}>
                * 개인정보 보호법 제28조의8에 따른 국외 이전 고지 포함
              </p>
            </section>

            {/* 게이트 6: 정보주체 권리 행사 방법 */}
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1C1C1C', fontFamily: 'var(--font-playfair,serif)' }}>
                6. 정보주체의 권리와 행사 방법
              </h2>
              <p className="mb-4">이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { right: '개인정보 열람 요청', desc: '수집된 개인정보 확인' },
                  { right: '개인정보 수정·삭제', desc: '부정확한 정보 정정 또는 삭제' },
                  { right: '처리 정지 요청', desc: '개인정보 처리의 일시 중단' },
                  { right: '동의 철회', desc: '마케팅 수신 동의 등 철회' },
                ].map(item => (
                  <div key={item.right} className="p-4 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid rgba(28,28,28,0.08)' }}>
                    <p className="font-semibold mb-1 text-xs" style={{ color: '#2D4A3E' }}>{item.right}</p>
                    <p className="text-xs" style={{ color: 'rgba(28,28,28,0.5)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl" style={{ background: '#F0EDE6', border: '1px solid rgba(28,28,28,0.08)' }}>
                <p className="font-semibold mb-2 text-xs" style={{ color: '#1C1C1C' }}>권리 행사 방법</p>
                <ul className="space-y-1 text-xs" style={{ color: 'rgba(28,28,28,0.7)' }}>
                  <li>• 이메일: <span className="font-medium" style={{ color: '#2D4A3E' }}>kinjungho@gmail.com</span></li>
                  <li>• 처리 기간: 요청 접수 후 10일 이내</li>
                  <li>• 거부 시 사유 고지 의무 이행</li>
                </ul>
              </div>
              <p className="mt-3 text-xs" style={{ color: 'rgba(28,28,28,0.45)' }}>
                개인정보 침해 관련 신고·상담은 개인정보보호위원회(118) 또는 한국인터넷진흥원 개인정보침해신고센터(privacy.kisa.or.kr)에 문의하실 수 있습니다.
              </p>
            </section>

            {/* 개인정보 보호책임자 */}
            <section className="pt-6" style={{ borderTop: '1px solid rgba(28,28,28,0.1)' }}>
              <h2 className="text-base font-bold mb-3" style={{ color: '#1C1C1C' }}>개인정보 보호책임자</h2>
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

      {/* 푸터 */}
      <footer className="py-8 px-8" style={{ background: '#1C1C1C' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/Logo.png" alt="MUTE" width={80} height={28} className="h-6 w-auto object-contain brightness-0 invert opacity-50" />
          <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>
            © 2023 MUTE EYELASH SALON · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
