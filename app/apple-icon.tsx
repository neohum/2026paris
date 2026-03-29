import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{ background: '#0055A4', width: '33.33%', height: '100%' }} />
        <div style={{ background: '#FFFFFF', width: '33.33%', height: '100%' }} />
        <div style={{ background: '#EF4135', width: '33.33%', height: '100%' }} />
      </div>
    ),
    { ...size }
  );
}
