# CLAUDE.md — lash-salon-admin

> 이 문서는 **Claude Code가 lash-salon-admin 프로젝트를 작업할 때 따라야 할 단일 진실(Single Source of Truth)** 입니다.
> 모든 의사결정은 이 문서를 기준으로 합니다. 충돌 시 이 문서가 우선합니다.

---

## 📌 프로젝트 개요

### 프로젝트명
- **공식 이름**: `lash-salon-admin`
- **표시 이름**: 속눈썹펌 살롱 관리자
- **목적**: 동네 1인 속눈썹 펌 살롱 사장님 전용 운영 자동화 백오피스

### 비즈니스 컨텍스트
- **타겟 사용자**: 1인 속눈썹펌 살롱 운영자 (사장님 본인)
- **현재 매출**: 월 600~900만원
- **시술 1건 소요**: 2시간
- **시술 메뉴**: 클래식 / 볼륨 / 하이브리드
- **현재 운영 방식**: 인스타 DM + 카톡 채널 예약 → 매장 카드 결제

### 해결하려는 페인 포인트 4가지
1. **이중 예약 사고**: DM/카톡 두 채널에서 예약 받다가 같은 시간대 두 명 겹친 경험
2. **고객 거주지 미파악**: 어느 동네에서 오는지 몰라 마케팅 집중 지점 결정 어려움
3. **트렌드 추적 수동**: 새 메뉴 결정 때마다 인스타 인플루언서 손으로 검색
4. **데이터 보안**: 운영 데이터는 사장님 본인만 접근 가능해야 함

### 핵심 가치
> "사장님 1인 운영 백오피스" — 손님용 예약 페이지가 아닌 **사장님 전용 콘솔**

---

## 🛠 기술 스택 (확정)

| 항목 | 확정값 | 비고 |
|------|--------|------|
| **프레임워크** | Next.js 14 | App Router |
| **언어** | TypeScript | 외부 API 4종 연동 → 타입 안정성 필수 |
| **DB** | Supabase | DB + Auth + RLS |
| **인증** | Supabase Auth | Google OAuth + 이메일 |
| **스타일링** | Tailwind CSS + shadcn/ui | 빠른 UI 구현 |
| **배포** | Vercel | |
| **외부 API** | Google Calendar / Kakao Maps + Local / 네이버 데이터랩 | |

### ⚠️ 의도적으로 사용하지 **않는** 기술
- ❌ **Google Maps API** — 카드 등록 부담 + 한국 동 단위 정확도 낮음 → Kakao 사용
- ❌ **Google Geocoding API** — 같은 이유 → Kakao Local API 사용
- ❌ **유튜브 Data API** — 트렌드 키워드는 네이버 데이터랩 단일로 단순화
- ❌ **Pages Router** — App Router 사용

---

## 🏗 아키텍처 핵심 결정사항

### 1. Supabase 인스턴스 — 공유 사용
- **인스턴스**: `xsfriegbpygydcqhsqqq.supabase.co` (학습용 공유)
- **격리 방식**: 모든 테이블/정책에 `lash_salon_*` prefix 강제
- **이유**: 새 프로젝트 생성 불가 (기존 활성 2개로 한도 도달)

### 2. 테이블 네이밍 규칙 (절대 위반 금지)
```
모든 테이블: lash_salon_{명사}
모든 RLS 정책: lash_salon_{table_short}_{action}_policy
모든 Storage 버킷: lash-salon-{purpose}
```

### 3. 캘린더 연동
- **방식**: 사장님 개인 Google Calendar 직접 사용
- **이유**: 사장님이 모바일 Google Calendar 앱으로도 알림 받음

### 4. 이중 예약 차단
- **방식**: DB unique constraint + GCal freebusy API 이중 검증
- **트랜잭션 순서**:
  ```
  ① GCal freebusy 확인
  ② DB INSERT (unique constraint)
  ③ 성공 시 GCal 이벤트 생성
  ④ 실패 시 DB 롤백
  ```

### 5. 동네 좌표 변환
- **시점**: 예약 등록 시 즉시 Geocoding (Kakao Local API)
- **이유**: 지도 화면 진입 시마다 호출 방지 (성능 + 비용)

### 6. 트렌드 갱신
- **방식**: 사장님 "새로고침" 버튼 수동 호출
- **이유**: MVP 단순화. 자동 cron은 차후 추가

### 7. 디자인 컨셉
- **방향**: **럭셔리 베이스**
- **참고 스타일**: Aesop, Cle de Peau (다크 + 골드 액센트, 세리프 헤딩, 여백 강조)
- **스킬**: `frontend-design` 스킬 적용

### 8. 공유 인스턴스 보안 추가 로직 ⚠️ 필수
```typescript
// middleware.ts 또는 Server Component에서
// auth.uid()가 lash_salon_owner_profiles에 있는지 확인
if (loggedInUser && !ownerProfileExists) {
  // 다른 학습 프로젝트 사용자가 잘못 들어옴 → 차단
  redirect('/login?error=not_authorized');
}
```
**이유**: Supabase Auth는 인스턴스 전체에서 `auth.users` 공유. 다른 학습 프로젝트 사용자가 lash-salon-admin에 자동 접근하는 사고 방지.

---

## 📦 DB 스키마 (확정)

### 테이블 구조

```sql
-- 1. lash_salon_owner_profiles — 사장님 프로필
CREATE TABLE lash_salon_owner_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT,
    google_calendar_id TEXT,
    gcal_refresh_token TEXT,        -- 암호화 권장
    gcal_access_token TEXT,
    gcal_token_expires_at TIMESTAMPTZ,
    consent_terms_at TIMESTAMPTZ,   -- PIPA 동의 시각
    consent_marketing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. lash_salon_customers — 고객
CREATE TABLE lash_salon_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    district TEXT,                  -- 동 이름
    district_lat NUMERIC,
    district_lng NUMERIC,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. lash_salon_menus — 시술 메뉴
CREATE TABLE lash_salon_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,             -- 클래식 / 볼륨 / 하이브리드
    price INT NOT NULL,
    duration_min INT DEFAULT 120,   -- 기본 2시간
    color_tag TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. lash_salon_bookings — 예약
CREATE TABLE lash_salon_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES lash_salon_customers(id),
    menu_id UUID NOT NULL REFERENCES lash_salon_menus(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    google_event_id TEXT,
    status TEXT DEFAULT 'confirmed' 
        CHECK (status IN ('confirmed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 이중 예약 차단 (같은 사장님의 같은 시작시간 중복 방지)
    UNIQUE (owner_id, start_at)
);

-- 5. lash_salon_trend_keywords — 트렌드 키워드
CREATE TABLE lash_salon_trend_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    last_search_volume NUMERIC,
    last_fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (owner_id, keyword)
);

-- 6. lash_salon_trend_history — 검색량 시계열
CREATE TABLE lash_salon_trend_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword_id UUID NOT NULL REFERENCES lash_salon_trend_keywords(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    search_ratio NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS 정책 (모든 테이블 필수)

```sql
-- 모든 테이블 RLS 활성화
ALTER TABLE lash_salon_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_trend_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_trend_history ENABLE ROW LEVEL SECURITY;

-- 정책 패턴: lash_salon_{table}_{action}_policy
-- 모든 테이블에 SELECT/INSERT/UPDATE/DELETE 4종 정책 적용
-- 기준: owner_id = auth.uid() 또는 id = auth.uid() (owner_profiles)

-- trend_history는 keyword를 통한 간접 검증
CREATE POLICY lash_salon_trend_history_select_own_policy
    ON lash_salon_trend_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM lash_salon_trend_keywords
        WHERE id = lash_salon_trend_history.keyword_id
        AND owner_id = auth.uid()
    ));
```

---

## 📁 폴더 구조 (확정)

```
/lash-salon-admin
├── /app
│   ├── /(auth)
│   │   ├── /login/page.tsx
│   │   └── /signup/page.tsx              # PIPA 동의 체크박스 포함
│   ├── /(dashboard)
│   │   ├── /page.tsx                     # 오늘의 예약 대시보드
│   │   ├── /calendar/page.tsx            # 예약 캘린더 (메인)
│   │   ├── /customers/                   # 고객 목록 + 등록
│   │   ├── /map/page.tsx                 # 동네별 고객 지도
│   │   ├── /trends/page.tsx              # 트렌드 키워드
│   │   └── /admin/
│   │       ├── /menus/page.tsx           # 시술 메뉴 관리
│   │       └── /settings/page.tsx        # 캘린더 연동 / 프로필
│   ├── /api
│   │   ├── /bookings/                    # 예약 CRUD + 중복 검증
│   │   ├── /google-calendar/             # GCal 동기화
│   │   ├── /auth/google-calendar-callback/  # GCal OAuth 콜백
│   │   ├── /geocode/                     # Kakao 주소→좌표 변환
│   │   └── /trends/                      # 네이버 데이터랩 호출
│   ├── /privacy/page.tsx                 # 개인정보 처리방침 (PIPA)
│   ├── /layout.tsx
│   └── /globals.css
├── /components
│   ├── /ui                               # shadcn/ui
│   ├── /calendar/                        # 예약 캘린더
│   ├── /map/                             # Kakao Maps 컴포넌트
│   ├── /trends/                          # 트렌드 차트 (recharts)
│   ├── /customers/                       # 고객 폼
│   └── /legal/                           # 동의 체크박스
├── /lib
│   ├── /supabase/                        # 클라/서버 클라이언트
│   ├── /google/
│   │   └── /calendar.ts                  # Sub-B 영역
│   ├── /kakao/
│   │   └── /local.ts                     # Sub-A 영역 (Geocoding)
│   ├── /naver/
│   │   └── /datalab.ts                   # Sub-D 영역
│   └── /utils/
├── /types
├── /public
├── .env.local                            # ⚠️ git 절대 금지
├── .env.local.example                    # 템플릿 (커밋 OK)
├── .gitignore
├── middleware.ts                         # 인증 + 공유 인스턴스 보호
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── CLAUDE.md                             # 이 문서
└── CLEANUP.md                            # 프로젝트 종료 시 정리 가이드
```

---

## 🔑 환경변수

### .env.local 구조

```bash
# ============================================
# lash-salon-admin 환경변수
# ============================================

# --- Supabase (프로젝트 전용) ---
NEXT_PUBLIC_SUPABASE_URL=https://xsfriegbpygydcqhsqqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<프로젝트 전용>
SUPABASE_SERVICE_ROLE_KEY=<서버 전용, 클라이언트 노출 금지>

# --- Google OAuth (프로젝트 전용) ---
GOOGLE_CLIENT_ID=<lash-salon-admin-web Client ID>
GOOGLE_CLIENT_SECRET=<lash-salon-admin-web Client Secret>

# --- Kakao Maps (공용 풀 - shared-learning-kakao) ---
NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY=<JavaScript 키>
KAKAO_REST_API_KEY=<REST API 키, 서버 전용>

# --- Naver Datalab (공용 풀 - shared-learning-naver-datalab) ---
NAVER_CLIENT_ID=<공용 키>
NAVER_CLIENT_SECRET=<공용 키>

# --- 사이트 ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### .env.local.example (커밋 OK)
실제 값 없이 변수명만 있는 템플릿. 새 환경에서 어떤 키 필요한지 알 수 있게.

### 키 보관 위치 (정호님 로컬)
```
~/keys/projects/lash-salon-admin/   # 프로젝트 전용
  ├── supabase.env
  └── google-oauth.env

~/keys/shared/                       # 공용 풀 (재사용)
  ├── kakao-maps.env
  └── naver-datalab.env
```

---

## 🚀 개발 순서 (15단계, 의존성 그래프)

```
[1. 환경설정] ──┬→ [2. DB+RLS] ──→ [3. 인증] ──→ [4. 미들웨어]
                │                       │
                │                       ↓
                │                 [5. 메뉴 관리] ──→ [6. 고객+Geocoding]
                │                       │                  │
                │                       ↓                  │
                │                 [7. GCal 연동] ───┐      │
                │                                    ↓      ↓
                │                              [8. 예약+이중차단]
                │                                    ↓
                │                       [9. 캘린더 UI] ──→ [10. 대시보드]
                │                                                ↓
                ├→ [12. 트렌드 화면] ────────────────────────────┤
                │                                                ↓
                └→ [13. PIPA 처방침] ──────────────→ [11. 지도] ──→ [14. 디자인 마감] ──→ [15. 배포]
```

### 단계별 상세

| # | 기능 | 전제 | 병목 |
|---|------|------|------|
| 1 | 환경 설정 (.env / Supabase 연결 / 외부 API 키) | 없음 | **높음** — 4종 외부 키 누락 시 후속 전체 정지 |
| 2 | Supabase 6개 테이블 + RLS 정책 | 1 | 중간 — RLS 빠뜨리면 보안 구멍 |
| 3 | 인증 (Google OAuth + 이메일) | 1, 2 | **높음** — Redirect URI 불일치 |
| 4 | 미들웨어 (보호 라우트 + 공유 인스턴스 보호) | 3 | 낮음 |
| 5 | 시술 메뉴 관리 | 3, 4 | 낮음 |
| 6 | 고객 등록 + Kakao Geocoding | 5 | 중간 — Geocoding 실패 처리 |
| 7 | Google Calendar OAuth + 토큰 관리 | 3 | **높음** — 토큰 갱신 / scope |
| 8 | 예약 CRUD + 이중 예약 차단 | 5, 6, 7 | **높음** — 동시성 / 트랜잭션 |
| 9 | 예약 캘린더 UI | 8 | 중간 |
| 10 | 오늘의 예약 대시보드 | 8, 9 | 낮음 |
| 11 | 동네별 고객 분포 지도 (Kakao Maps) | 6 | 중간 — 핀 클러스터링 |
| 12 | 네이버 데이터랩 트렌드 | 1 | 중간 — API 응답 정규화 |
| 13 | PIPA 개인정보 처리방침 | 없음 (병렬) | 낮음 |
| 14 | 모바일 반응형 + 럭셔리 디자인 마감 | 9~13 | 낮음 |
| 15 | Vercel 배포 + 환경변수 등록 + Redeploy | 1~14 | **높음** — 환경변수 누락 |

### 4대 병목 사전 대응

#### 🔴 병목 1: 1번 (환경 설정)
- **이유**: 외부 API 5종 키 중 하나라도 누락 시 후속 전체 정지
- **대응**: Stage 4 사용자 액션아이템에서 **모든 키 한 번에 발급** 강제

#### 🔴 병목 2: 3번 (Google OAuth)
- **이유**: Redirect URI 오타 / scope 누락 빈번
- **대응**: 로컬 + Supabase 콜백 URI 동시 등록. Calendar scope 별도 명시

#### 🔴 병목 3: 7번 (Google Calendar 토큰)
- **이유**: Calendar는 일반 로그인과 별도 OAuth flow + scope. 토큰 만료 처리 누락
- **대응**: `refresh_token` 저장 + 자동 갱신 함수 우선 구현

#### 🔴 병목 4: 8번 (이중 예약 차단)
- **이유**: 동시 예약 시도 시 GCal에 둘 다 생성 위험
- **대응**: 트랜잭션 순서 강제 (freebusy → DB INSERT → GCal 생성 → 실패 시 롤백)

---

## 📋 마일스톤 (5단계)

| 마일스톤 | 단계 | 의미 |
|---------|------|------|
| **M1: 기반** | 1~4 | 환경 / DB / 인증 / 보호 |
| **M2: 데이터 입력** | 5~7 | 메뉴 / 고객 / 캘린더 연동 |
| **M3: 핵심 기능** | 8~10 | **예약 + 캘린더 + 대시보드 (서비스 본질)** |
| **M4: 시각화** | 11~12 | 지도 + 트렌드 |
| **M5: 마감** | 13~15 | 처방침 / 디자인 / 배포 |

> **M3 완료 시점이 "사장님이 실제로 써볼 수 있는 최소 동작 버전"**
> 여기서 한 번 사용 테스트 + 피드백 후 M4 진입

---

## 🤖 Sub-Agent 병렬 실행 설계

### 메인 + 5개 Sub-Agent 구조

| Sub | 담당 단계 | 병렬 짝 | 시작 가능 시점 |
|-----|----------|--------|---------------|
| **메인** | 1~4, 8~10, 14~15 | (직렬) | 처음부터 |
| **Sub-A: 도메인** | 5, 6 | Sub-B와 병렬 | M1 완료 후 |
| **Sub-B: GCal** | 7 | Sub-A와 병렬 | M1 완료 후 |
| **Sub-C: 지도** | 11 | Sub-D와 병렬 | M3 완료 후 |
| **Sub-D: 트렌드** | 12 | Sub-C와 병렬 | M3 완료 후 |
| **Sub-E: 컴플라이언스** | 13 | 어느 단계와도 병렬 | **M1 완료 직후 가장 먼저 spawn** |

### 실행 타임라인
```
시간 →
─────────────────────────────────────────────────────────────────
[메인]  M1(1~4) ─→ M3(8~10) ─→ M5 마감(14~15)
           ↓           ↑                ↑
        [Sub-A]   M2: 5,6번 ──┘
        [Sub-B]   M2: 7번 ────┘
           ↓
        [Sub-C]              M4: 11번 ────────┘
        [Sub-D]              M4: 12번 ────────┘
           ↓
        [Sub-E]   M1 직후 spawn → 13번 (M5 사이 언제든) ┘
```

### Sub-Agent 충돌 방지 5원칙 ⚠️ 절대 위반 금지

```
1. .env.local 수정 → 메인만
2. package.json (의존성 추가) → 메인만
3. DB 마이그레이션 → 메인만 (Sub는 SQL 작성 후 메인에 요청)
4. 각 Sub는 할당된 폴더 외 절대 수정 금지
5. /lib/google/ 폴더는 메인이 빈 파일 미리 생성 (maps.ts ❌ → kakao/local.ts, calendar.ts)
```

### Sub-Agent별 작업 영역

#### Sub-A: 도메인 데이터 (메뉴 + 고객 + Geocoding)
**허용 폴더:**
- `/app/(dashboard)/admin/menus/**`
- `/app/(dashboard)/customers/**`
- `/app/api/customers/**`
- `/app/api/geocode/**`
- `/lib/kakao/local.ts` (메인이 빈 파일 생성)
- `/components/customers/**`

**허용 DB 테이블:**
- `lash_salon_menus` (전체 권한)
- `lash_salon_customers` (전체 권한)
- `lash_salon_owner_profiles` (읽기만)

**완료 기준:**
- ✅ 메뉴 CRUD + 클래식/볼륨/하이브리드 시드 데이터
- ✅ 고객 등록 시 동네 입력 → Kakao Local API 호출 → 좌표 저장
- ✅ Geocoding 실패 시 좌표 NULL 저장 금지 (재입력 유도)
- ✅ 다른 사장님 데이터 RLS 차단 검증

#### Sub-B: Google Calendar 연동
**허용 폴더:**
- `/app/api/google-calendar/**`
- `/lib/google/calendar.ts` (메인이 빈 파일 생성)
- `/app/(dashboard)/admin/settings/**`
- `/app/api/auth/google-calendar-callback/**`

**허용 DB 테이블:**
- `lash_salon_owner_profiles` (gcal 관련 컬럼만 수정)

**기술 요구사항:**
- scope: `https://www.googleapis.com/auth/calendar.events`
- `refresh_token` 저장 + 자동 갱신
- `isSlotAvailable(start, end)` 함수
- 이벤트 CRUD 함수

**완료 기준:**
- ✅ /admin/settings에서 "Google Calendar 연결" 버튼 → OAuth → 토큰 저장
- ✅ 토큰 만료 후 자동 갱신
- ✅ freebusy 조회 함수 GCal 동기화 결과 반환
- ✅ 더미 이벤트 생성/삭제 단위 테스트 통과

#### Sub-C: 동네별 고객 분포 지도
**허용 폴더:**
- `/app/(dashboard)/map/**`
- `/components/map/**`

**허용 DB 테이블:**
- `lash_salon_customers` (READ-ONLY)
- `lash_salon_bookings` (READ-ONLY, 노쇼 필터용)

**기술 요구사항:**
- `react-kakao-maps-sdk` 사용
- 핀 클러스터링 (10개 이상 시)
- 동네별 방문 횟수 → 핀 크기/히트맵
- 노쇼(`status='no_show'`) 제외 토글
- 기간 필터 (최근 1/3개월/전체)
- 핀 클릭 시 동네별 방문 수 + 인기 메뉴

**완료 기준:**
- ✅ 지도 진입 시 모든 고객 동네 핀 표시
- ✅ 클러스터링 작동
- ✅ 노쇼 제외/포함 토글
- ✅ 기간 필터
- ✅ 모바일 반응형

#### Sub-D: 네이버 데이터랩 트렌드
**허용 폴더:**
- `/app/(dashboard)/trends/**`
- `/app/api/trends/**`
- `/lib/naver/datalab.ts`
- `/components/trends/**`

**허용 DB 테이블:**
- `lash_salon_trend_keywords` (전체)
- `lash_salon_trend_history` (전체)

**기술 요구사항:**
- 네이버 데이터랩 "검색어트렌드" API
- 사장님이 키워드 추가/삭제
- "새로고침" 버튼 → 최근 30일 검색량 → `lash_salon_trend_history`에 저장
- 차트: `recharts`
- `NAVER_CLIENT_SECRET` 클라이언트 노출 절대 금지 (Server Action / Route Handler)

**완료 기준:**
- ✅ 키워드 CRUD
- ✅ 새로고침 → API 호출 → 차트 갱신
- ✅ 30일 추이 라인 차트
- ✅ 일일 한도(1,000회) 근접 시 경고

#### Sub-E: PIPA 컴플라이언스 (M1 직후 spawn)
**허용 폴더:**
- `/app/privacy/**`
- `/app/(auth)/signup/page.tsx` (동의 체크박스만 추가)
- `/components/legal/**`

**허용 DB 테이블:**
- `lash_salon_owner_profiles`에 `consent_marketing`, `consent_terms_at` 컬럼 (메인에 마이그레이션 요청)

**필수 스킬:**
- `pipa-signup-compliance-skill` (한국 개인정보보호법 6 게이트)

**완료 기준:**
- ✅ /privacy 페이지 6 게이트 모두 표시
  1. 수집 항목/목적/보유기간
  2. 동의 체크박스 (필수/선택 분리)
  3. 만 14세 미만 차단
  4. 처리방침 별도 페이지
  5. 위탁/제3자 제공 명시 (Supabase, Google, Vercel, 네이버, Kakao)
  6. 정보주체 권리 행사 방법
- ✅ 회원가입 시 필수 동의 안 하면 가입 차단
- ✅ 동의 시각 DB 저장
- ✅ 만 14세 미만 차단

---

## 🎨 디자인 가이드라인

### 컨셉
**럭셔리 베이스** — Aesop / Cle de Peau 스타일

### 디자인 토큰 (예상)
```
색상:
  - 배경: 다크 (#0A0A0A or #1A1A1A)
  - 액센트: 골드 (#D4AF37 or #C9A961)
  - 텍스트: 화이트 / 베이지 / 골드
  - 보조: 그레이 톤

타이포그래피:
  - 헤딩: 세리프 (Playfair Display, Cormorant)
  - 본문: 산세리프 (Inter, Pretendard)

여백:
  - 충분한 화이트(블랙)스페이스
  - 콘텐츠 밀집도 낮게

UI 톤:
  - 미니멀, 정제됨, 우아함
  - 화려한 그라데이션 / 네온 금지
```

### 스킬 사용
`frontend-design` 스킬 적용 — Claude Code는 이 스킬의 SKILL.md를 먼저 view한 후 컴포넌트 작성.

---

## 🔒 보안 정책

### 절대 규칙
1. `SUPABASE_SERVICE_ROLE_KEY`, `NAVER_CLIENT_SECRET`, `KAKAO_REST_API_KEY`, `GOOGLE_CLIENT_SECRET` → **클라이언트 코드 노출 금지** (Server-only)
2. `.env.local` → `.gitignore` 필수
3. 모든 테이블 RLS 활성화
4. 공유 Supabase 인스턴스 → 미들웨어에서 `lash_salon_owner_profiles` 존재 확인 (다른 학습 프로젝트 사용자 차단)
5. PIPA: 만 14세 미만 차단 + 동의 시각 저장
6. `gcal_refresh_token` → 가능하면 Supabase Vault 또는 암호화 컬럼

### .gitignore 필수 항목
```
.env.local
.env*.local
node_modules/
.next/
.vercel/
*.log
.DS_Store
```

---

## 🧪 검증 체크리스트 (M1 시작 전)

### Stage 6 검증 항목
- [ ] `.env.local` 정상 로드 (모든 키 채워짐)
- [ ] Supabase 연결 OK (anon key로 ping)
- [ ] Google OAuth Redirect URI 정확 (localhost + Supabase 콜백)
- [ ] Kakao 도메인 등록 OK
- [ ] Naver 환경 등록 OK
- [ ] `.gitignore`에 `.env.local` 포함
- [ ] Supabase 인스턴스에 `lash_salon_*` 충돌 테이블 없음
- [ ] Supabase Authentication → Google Provider 활성화 + Save 완료
- [ ] Node 20 LTS 이상

### M3 완료 후 (사용자 테스트 시점)
- [ ] 사장님이 회원가입 → 로그인 가능
- [ ] 메뉴 등록 (클래식/볼륨/하이브리드)
- [ ] 고객 등록 + 동네 좌표 저장
- [ ] Google Calendar 연결 + 예약 시 자동 이벤트 생성
- [ ] 같은 시간 두 명 예약 시도 → 차단 확인
- [ ] 오늘의 예약 대시보드 확인

### M5 배포 후
- [ ] Vercel 환경변수 9종 모두 등록
- [ ] 배포 도메인을 GCP OAuth Redirect URI에 추가
- [ ] 배포 도메인을 Kakao Web 플랫폼에 추가
- [ ] Redeploy 실행
- [ ] 통합 테스트 (회원가입 → 예약 → 지도 확인)

---

## 📚 외부 API 레퍼런스

### Supabase
- Docs: https://supabase.com/docs
- Auth Helpers (Next.js App Router): https://supabase.com/docs/guides/auth/server-side/nextjs

### Google Calendar API
- Docs: https://developers.google.com/calendar/api/v3/reference
- 핵심 엔드포인트:
  - `freebusy.query` — 빈 시간 조회
  - `events.insert` / `events.delete` — 이벤트 CRUD
- Scope: `https://www.googleapis.com/auth/calendar.events`

### Kakao Maps + Local API
- Maps SDK: https://apis.map.kakao.com/web/documentation/
- Local API (주소 검색): https://developers.kakao.com/docs/latest/ko/local/dev-guide
- Geocoding 엔드포인트: `GET https://dapi.kakao.com/v2/local/search/address.json`
- 인증: Authorization 헤더 `KakaoAK {REST_API_KEY}`

### 네이버 데이터랩
- Docs: https://developers.naver.com/docs/serviceapi/datalab/search/search.md
- 엔드포인트: `POST https://openapi.naver.com/v1/datalab/search`
- 일일 한도: 1,000회

---

## 🚦 Claude Code 작업 시 행동 규칙

### 1. 작업 시작 시
- 이 CLAUDE.md를 먼저 처음부터 끝까지 읽는다
- 관련 SKILL.md (`frontend-design`, `pipa-signup-compliance-skill`)를 view 한다
- 현재 어떤 마일스톤(M1~M5)을 작업 중인지 명시하고 시작한다

### 2. 작업 중
- 단계별 완료 기준을 충족하면 사용자에게 보고
- 보고 형식: `[현재 단계 X번 완료] 동작 확인됨: [목록], 발견 이슈: [있으면]`
- 막히면 즉시 보고. 우회 시도 전에 사용자 의견 확인

### 3. Sub-Agent spawn 시
- 호출 프롬프트에 **허용 폴더 / 허용 DB 테이블 / 금지 사항** 명시
- Sub 결과 받으면 메인이 통합 테스트 후 다음 단계 진행
- Sub가 보고한 "추가 필요 패키지"는 메인이 일괄 설치

### 4. 막힐 때 우선순위
1. 이 CLAUDE.md 먼저 확인
2. 관련 외부 API 공식 문서 확인
3. 그래도 모르면 → 사용자에게 보고 (추측 시도 금지)

### 5. 절대 금지 사항
- 임의로 prefix 변경 (`lash_salon_*` 외 사용 금지)
- 환경변수 추가 시 사용자 미확인 (필요 시 사용자에게 발급 요청)
- 결제 계정 연결 필요한 API 사용 (Google Maps 등)
- `.env.local` git 커밋
- Supabase 다른 prefix 테이블 (예: `hgm_*`) 건드리기

---

## 📝 변경 이력

이 문서가 변경되면 아래에 기록.

| 날짜 | 변경 내용 | 결정자 |
|------|---------|--------|
| 2026-XX-XX | 최초 작성 (Stage 1~4 완료 시점) | 정호 + Claude |

---

## 📎 관련 문서

- `CLEANUP.md` — 프로젝트 종료 시 일괄 정리 가이드
- `~/keys/shared/SHARED_KEYS_GUIDE.md` — 공용 환경변수 재사용 가이드
- `~/keys/shared/REGISTRY.md` — 공용 키 사용 프로젝트 등록부

---

## 🎯 핵심 원칙 요약

```
┌─────────────────────────────────────────────────┐
│ 1. 사장님 1인 운영 백오피스 (손님용 X)           │
│ 2. 모든 테이블/정책: lash_salon_* prefix 강제   │
│ 3. 공유 Supabase 인스턴스 + 미들웨어 보호       │
│ 4. 결제 계정 필요한 API 사용 금지 (Kakao 사용)  │
│ 5. Google Calendar 직접 연동 + freebusy 검증    │
│ 6. 럭셔리 디자인 베이스                         │
│ 7. 메인 + 5 Sub-Agent 병렬 실행                 │
│ 8. 환경변수 / 의존성 / DB 마이그레이션은 메인만 │
└─────────────────────────────────────────────────┘
```

**이 문서를 어기는 변경은 사용자 승인 없이 하지 않는다.**
