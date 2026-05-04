-- 고객 테이블에 user_id 컬럼 추가 (고객 로그인 연동)
ALTER TABLE lash_salon_customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS lash_salon_customers_user_id_idx ON lash_salon_customers(user_id);
