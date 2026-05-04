export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-3xl font-bold text-[#F5F0E8] mb-2"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          개인정보 처리방침
        </h1>
        <p className="text-sm text-[rgba(245,240,232,0.4)] mb-10">최종 업데이트: 2026년 5월</p>

        <div className="space-y-8 text-sm text-[rgba(245,240,232,0.7)] leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-[#F5F0E8] mb-3">1. 수집하는 개인정보 항목 및 목적</h2>
            <p>살롱 관리자는 다음과 같은 개인정보를 수집·이용합니다:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>이메일 주소: 계정 인증 및 서비스 이용</li>
              <li>고객 이름, 연락처: 예약 관리</li>
              <li>고객 거주 동네: 마케팅 지역 분석</li>
            </ul>
            <p className="mt-2">보유 기간: 회원 탈퇴 시까지</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#F5F0E8] mb-3">2. 개인정보 제3자 제공 및 처리 위탁</h2>
            <p>서비스 운영을 위해 아래 업체에 처리를 위탁합니다:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Supabase Inc. — 데이터베이스 및 인증</li>
              <li>Vercel Inc. — 서버 호스팅</li>
              <li>Google LLC — 캘린더 연동, OAuth 인증</li>
              <li>Kakao Corp. — 지도 및 주소 검색</li>
              <li>NAVER Corp. — 검색 트렌드 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#F5F0E8] mb-3">3. 이용자의 권리</h2>
            <p>이용자는 언제든지 개인정보 열람, 수정, 삭제, 처리 정지를 요청할 수 있습니다. 요청은 이메일로 접수해 주세요.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#F5F0E8] mb-3">4. 만 14세 미만 이용 제한</h2>
            <p>본 서비스는 만 14세 미만 아동의 개인정보를 수집하지 않으며, 만 14세 미만은 서비스를 이용할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#F5F0E8] mb-3">5. 개인정보 보호책임자</h2>
            <p>이 방침에 관한 문의사항은 운영자에게 직접 연락해 주세요.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
