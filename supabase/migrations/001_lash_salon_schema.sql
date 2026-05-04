-- lash-salon-admin 스키마 마이그레이션
-- 모든 테이블은 lash_salon_* prefix 사용 (공유 Supabase 인스턴스 격리)

-- 1. 사장님 프로필
CREATE TABLE IF NOT EXISTS lash_salon_owner_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT,
    google_calendar_id TEXT,
    gcal_refresh_token TEXT,
    gcal_access_token TEXT,
    gcal_token_expires_at TIMESTAMPTZ,
    consent_terms_at TIMESTAMPTZ,
    consent_marketing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 고객
CREATE TABLE IF NOT EXISTS lash_salon_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    district TEXT,
    district_lat NUMERIC,
    district_lng NUMERIC,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 시술 메뉴
CREATE TABLE IF NOT EXISTS lash_salon_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INT NOT NULL,
    duration_min INT DEFAULT 120,
    color_tag TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 예약 (이중 예약 차단: UNIQUE on owner_id + start_at)
CREATE TABLE IF NOT EXISTS lash_salon_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES lash_salon_customers(id),
    menu_id UUID NOT NULL REFERENCES lash_salon_menus(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    google_event_id TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (owner_id, start_at)
);

-- 5. 트렌드 키워드
CREATE TABLE IF NOT EXISTS lash_salon_trend_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES lash_salon_owner_profiles(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    last_search_volume NUMERIC,
    last_fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (owner_id, keyword)
);

-- 6. 트렌드 시계열
CREATE TABLE IF NOT EXISTS lash_salon_trend_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword_id UUID NOT NULL REFERENCES lash_salon_trend_keywords(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    search_ratio NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE lash_salon_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_trend_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE lash_salon_trend_history ENABLE ROW LEVEL SECURITY;

-- owner_profiles RLS
CREATE POLICY lash_salon_owner_profiles_select_own_policy ON lash_salon_owner_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY lash_salon_owner_profiles_insert_own_policy ON lash_salon_owner_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY lash_salon_owner_profiles_update_own_policy ON lash_salon_owner_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY lash_salon_owner_profiles_delete_own_policy ON lash_salon_owner_profiles FOR DELETE USING (id = auth.uid());

-- customers RLS
CREATE POLICY lash_salon_customers_select_own_policy ON lash_salon_customers FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY lash_salon_customers_insert_own_policy ON lash_salon_customers FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY lash_salon_customers_update_own_policy ON lash_salon_customers FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY lash_salon_customers_delete_own_policy ON lash_salon_customers FOR DELETE USING (owner_id = auth.uid());

-- menus RLS
CREATE POLICY lash_salon_menus_select_own_policy ON lash_salon_menus FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY lash_salon_menus_insert_own_policy ON lash_salon_menus FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY lash_salon_menus_update_own_policy ON lash_salon_menus FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY lash_salon_menus_delete_own_policy ON lash_salon_menus FOR DELETE USING (owner_id = auth.uid());

-- bookings RLS
CREATE POLICY lash_salon_bookings_select_own_policy ON lash_salon_bookings FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY lash_salon_bookings_insert_own_policy ON lash_salon_bookings FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY lash_salon_bookings_update_own_policy ON lash_salon_bookings FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY lash_salon_bookings_delete_own_policy ON lash_salon_bookings FOR DELETE USING (owner_id = auth.uid());

-- trend_keywords RLS
CREATE POLICY lash_salon_trend_keywords_select_own_policy ON lash_salon_trend_keywords FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY lash_salon_trend_keywords_insert_own_policy ON lash_salon_trend_keywords FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY lash_salon_trend_keywords_update_own_policy ON lash_salon_trend_keywords FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY lash_salon_trend_keywords_delete_own_policy ON lash_salon_trend_keywords FOR DELETE USING (owner_id = auth.uid());

-- trend_history RLS (keyword를 통한 간접 검증)
CREATE POLICY lash_salon_trend_history_select_own_policy ON lash_salon_trend_history FOR SELECT
    USING (EXISTS (SELECT 1 FROM lash_salon_trend_keywords WHERE id = lash_salon_trend_history.keyword_id AND owner_id = auth.uid()));
CREATE POLICY lash_salon_trend_history_insert_own_policy ON lash_salon_trend_history FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM lash_salon_trend_keywords WHERE id = lash_salon_trend_history.keyword_id AND owner_id = auth.uid()));
CREATE POLICY lash_salon_trend_history_update_own_policy ON lash_salon_trend_history FOR UPDATE
    USING (EXISTS (SELECT 1 FROM lash_salon_trend_keywords WHERE id = lash_salon_trend_history.keyword_id AND owner_id = auth.uid()));
CREATE POLICY lash_salon_trend_history_delete_own_policy ON lash_salon_trend_history FOR DELETE
    USING (EXISTS (SELECT 1 FROM lash_salon_trend_keywords WHERE id = lash_salon_trend_history.keyword_id AND owner_id = auth.uid()));
