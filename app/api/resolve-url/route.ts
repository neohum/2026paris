import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // Google Maps 단축 URL(goo.gl 등)을 따라가서 최종 URL을 찾습니다
    const response = await fetch(url, { 
      redirect: 'follow', 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const finalUrl = response.url;
    
    // 최종 URL에서 @위도,경도 매칭 (예: @48.8583701,2.2944813)
    const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    /* 
      간혹 구글맵 모바일 환경에서는 /place/주소명/data=!3d위도!4d경도 형태가 나올 수도 있습니다.
      이 부분까지 커버하는 정규식:
    */
    const altMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

    if (match) {
      return NextResponse.json({ lat: parseFloat(match[1]), lng: parseFloat(match[2]) });
    } else if (altMatch) {
      return NextResponse.json({ lat: parseFloat(altMatch[1]), lng: parseFloat(altMatch[2]) });
    }
    
    return NextResponse.json({ error: '최종 주소에서 좌표(@위도,경도 형제 등)를 찾을 수 없습니다.', finalUrl }, { status: 404 });
  } catch (error) {
    console.error('URL Resolve error:', error);
    return NextResponse.json({ error: '주소 해석에 실패했습니다.' }, { status: 500 });
  }
}
