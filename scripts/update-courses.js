const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();
  console.log('Connected to DB');

  try {
    // Delete existing records for courses 2, 3, 4 to replace them
    await client.query('DELETE FROM course_places WHERE course_id IN (2, 3, 4);');
    console.log('Deleted old course places for course 2,3,4');

    // Insert new data
    const query = `
      INSERT INTO course_places (course_id, name, description, lat, lng, visit_date, day_number, place_order, activities) VALUES
      -- 코스 1 노르망디
      (2, '에트르타 (Étretat)', '코끼리 바위 절벽으로 유명한 해안', 49.7070, 0.2060, '2026-08-05', 6, 1, '팔레즈 산책, 절벽 뷰포인트, 해변'),
      (2, '옹플뢰르 (Honfleur)', '아기자기한 항구 도시', 49.4187, 0.2330, '2026-08-06', 7, 1, '비외 바셍(구항구) 산책, 해산물 식사'),
      (2, '몽생미셸 (Mont-Saint-Michel)', '바다 위의 신비로운 수도원', 48.6361, -1.5115, '2026-08-07', 8, 1, '수도원 투어, 조수 간만 체험, 1박'),
      (2, '생말로 (Saint-Malo)', '중세 성벽으로 둘러싸인 항구 도시', 48.6493, -2.0254, '2026-08-08', 9, 1, '성벽 걷기, 해산물, 해변'),

      -- 코스 2 루아르
      (3, '샹보르 성 (Château de Chambord)', '루아르 최대 규모 고성', 47.6162, 1.5171, '2026-08-05', 6, 1, '이중 나선 계단, 테라스 전망, 정원'),
      (3, '슈농소 성 (Château de Chenonceau)', '강 위에 세워진 우아한 성', 47.3249, 1.0695, '2026-08-06', 7, 1, '정원 산책, 왕비의 다리'),
      (3, '앙제 (Angers)', '강력한 성채와 태피스트리의 도시', 47.4784, -0.5632, '2026-08-07', 8, 1, '앙제 성, 묵시록 태피스트리'),
      (3, '몽생미셸 (Mont-Saint-Michel)', '바다 위의 신비로운 수도원', 48.6361, -1.5115, '2026-08-08', 9, 1, '수도원 투어, 조수 간만 체험, 1박'),
      (3, '렌 (Rennes)', '브르타뉴 주도, 중세 목조 건물', 48.1173, -1.6778, '2026-08-09', 10, 1, '구시가 산책, 시장, 파리 복귀 경유'),

      -- 코스 3 브르타뉴
      (4, '몽생미셸 (Mont-Saint-Michel)', '바다 위의 신비로운 수도원', 48.6361, -1.5115, '2026-08-05', 6, 1, '수도원 투어, 조수 간만 체험, 1박'),
      (4, '디낭 (Dinan)', '중세 모습이 완벽히 보존된 성채 도시', 48.4550, -2.0500, '2026-08-06', 7, 1, '구시가지 산책, 랭스 항구, 중세 성벽'),
      (4, '페로 기렉 (Perros-Guirec)', '핑크 화강암 해안의 신비로운 절경', 48.8000, -3.4500, '2026-08-07', 8, 1, '핑크 화강암 트레킹, 세나 섬 전경'),
      (4, '렌 (Rennes)', '브르타뉴 주도, 파리 복귀 경유', 48.1173, -1.6778, '2026-08-08', 9, 1, '구시가 산책, 시장, 파리 복귀 경유');
    `;
    await client.query(query);
    console.log('Inserted updated courses');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
