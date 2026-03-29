-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 멤버 여행 정보 테이블
CREATE TABLE IF NOT EXISTS member_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  passport_last_name VARCHAR(100),
  passport_first_name VARCHAR(100),
  passport_number VARCHAR(50),
  passport_expiry DATE,
  birth_date DATE,
  emergency_contact VARCHAR(200),
  notes TEXT,
  photo_path VARCHAR(500),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 코스 테이블
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6',
  is_default BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 코스 장소 테이블
CREATE TABLE IF NOT EXISTS course_places (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  visit_date DATE,
  day_number INTEGER,
  place_order INTEGER DEFAULT 0,
  activities TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 가계부 테이블
CREATE TABLE IF NOT EXISTS ledger (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 식사, 교통, 숙소, 관광, 쇼핑, 기타
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  payer_id INTEGER REFERENCES users(id),
  payer_name VARCHAR(100),
  memo TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 코스 3개 삽입
INSERT INTO courses (name, description, color, is_default) VALUES
  ('파리 공통 일정', '7/31~8/4 파리 5일 투어', '#c9a227', TRUE),
  ('코스 1: 노르망디', '에트르타 → 옹플뢰르 → 몽생미셸 → 생말로', '#3b82f6', TRUE),
  ('코스 2: 루아르 고성', '샹보르 → 슈농소 → 앙제 → 몽생미셸', '#10b981', TRUE),
  ('코스 3: 브르타뉴', '몽생미셸 → 디낭 → 핑크 화강암 해안', '#8b5cf6', TRUE)
ON CONFLICT DO NOTHING;

-- 파리 공통 장소
INSERT INTO course_places (course_id, name, description, lat, lng, visit_date, day_number, place_order, activities) VALUES
  (1, '에펠탑', '파리의 상징적인 철탑', 48.8584, 2.2945, '2026-07-31', 1, 1, '야경 감상, 사이요 궁에서 포토샷'),
  (1, '센강 (바토무슈)', '센강 유람선 탑승 지점', 48.8619, 2.3081, '2026-07-31', 1, 2, '센강 유람선 탑승, 파리 야경'),
  (1, '루브르 박물관', '세계 최대 미술관', 48.8606, 2.3376, '2026-08-01', 2, 1, '모나리자, 비너스 조각, 오전 방문 추천'),
  (1, '샹젤리제 & 개선문', '파리 최고의 대로', 48.8738, 2.2950, '2026-08-01', 2, 2, '쇼핑, 카페, 개선문 전망대'),
  (1, '오르세 미술관', '인상파 작품의 보고', 48.8600, 2.3266, '2026-08-02', 3, 1, '고흐, 모네, 르누아르 작품 감상'),
  (1, '마레 지구 & 퐁피두 센터', '파리의 트렌디한 구역', 48.8606, 2.3522, '2026-08-02', 3, 2, '보쥬 광장 산책, 갤러리, 카페'),
  (1, '몽마르트르 언덕', '파리 화가들의 성지', 48.8867, 2.3431, '2026-08-03', 4, 1, '사크레쾨르 대성당, 아티스트 광장'),
  (1, '오페라 가르니에', '파리 오페라 극장', 48.8719, 2.3316, '2026-08-03', 4, 2, '화려한 외관 감상, 루프탑 전망'),
  (1, '베르사유 궁전', '태양왕의 화려한 궁전', 48.8049, 2.1204, '2026-08-04', 5, 1, '거울의 방, 왕실 정원, 운하'),

  -- 코스 1 노르망디
  (2, '에트르타 (Étretat)', '코끼리 바위 절벽으로 유명한 해안', 49.7070, 0.2060, '2026-08-05', 1, 1, '팔레즈 산책, 절벽 뷰포인트, 해변'),
  (2, '옹플뢰르 (Honfleur)', '아기자기한 항구 도시', 49.4187, 0.2330, '2026-08-06', 2, 1, '비외 바셍(구항구) 산책, 해산물 식사'),
  (2, '몽생미셸 (Mont-Saint-Michel)', '바다 위의 신비로운 수도원', 48.6361, -1.5115, '2026-08-07', 3, 1, '수도원 투어, 조수 간만 체험, 1박'),
  (2, '생말로 (Saint-Malo)', '중세 성벽으로 둘러싸인 항구 도시', 48.6493, -2.0254, '2026-08-09', 5, 1, '성벽 걷기, 해산물, 해변'),

  -- 코스 2 루아르
  (3, '샹보르 성 (Château de Chambord)', '루아르 최대 규모 고성', 47.6162, 1.5171, '2026-08-05', 1, 1, '이중 나선 계단, 테라스 전망, 정원'),
  (3, '슈농소 성 (Château de Chenonceau)', '강 위에 세워진 우아한 성', 47.3249, 1.0695, '2026-08-06', 2, 1, '정원 산책, 왕비의 다리'),
  (3, '앙제 (Angers)', '강력한 성채와 태피스트리의 도시', 47.4784, -0.5632, '2026-08-07', 3, 1, '앙제 성, 묵시록 태피스트리'),
  (3, '몽생미셸 (Mont-Saint-Michel)', '바다 위의 신비로운 수도원', 48.6361, -1.5115, '2026-08-08', 4, 1, '수도원 투어, 조수 간만 체험, 1박'),
  (3, '렌 (Rennes)', '브르타뉴 주도, 중세 목조 건물', 48.1173, -1.6778, '2026-08-10', 6, 1, '구시가 산책, 시장, 파리 복귀 경유'),

  -- 코스 3 브르타뉴
  (4, '몽생미셸 (Mont-Saint-Michel)', '바다 위의 신비로운 수도원', 48.6361, -1.5115, '2026-08-05', 1, 1, '수도원 투어, 조수 간만 체험, 1박'),
  (4, '디낭 (Dinan)', '중세 모습이 완벽히 보존된 성채 도시', 48.4550, -2.0500, '2026-08-07', 3, 1, '구시가지 산책, 랭스 항구, 중세 성벽'),
  (4, '페로 기렉 (Perros-Guirec)', '핑크 화강암 해안의 신비로운 절경', 48.8000, -3.4500, '2026-08-08', 4, 1, '핑크 화강암 트레킹, 세나 섬 전경'),
  (4, '렌 (Rennes)', '브르타뉴 주도, 파리 복귀 경유', 48.1173, -1.6778, '2026-08-09', 5, 1, '구시가 산책, 시장, 파리 복귀 경유')
ON CONFLICT DO NOTHING;
