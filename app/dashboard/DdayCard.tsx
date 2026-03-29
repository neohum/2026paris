'use client';

import { useState, useEffect } from 'react';
import './dashboard.css';

const HERO_IMAGES = [
  "/paris1.png",
  "/paris2.png",
  "/paris3.png",
  "/paris4.png",
  "/paris5.png",
  "/paris6.png",
];

export default function DdayCard({ diffDays }: { diffDays: number }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dday-card glass text-center">
      <div className="dday-carousel-wrapper">
        {HERO_IMAGES.map((src, idx) => (
          <div
            key={src}
            className={`dday-carousel-slide ${idx === currentIdx ? 'dday-carousel-active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="dday-carousel-overlay" />
      </div>

      <div className="dday-content">
        <h2>프랑스 파리 여행까지</h2>
        <div className="dday-number">D-{diffDays}</div>
        <p>2026.07.30 (목) ~ 08.13 (목)</p>
      </div>
    </div>
  );
}
