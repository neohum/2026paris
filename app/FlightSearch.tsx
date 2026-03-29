"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "./FlightSearch.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────
type Cabin = "economy" | "business" | "first";
type TripType = "round" | "oneway";

interface SearchParams {
  origin: string;
  destination: string;
  outbound: string;
  inbound: string;
  adults: number;
  cabin: Cabin;
  tripType: TripType;
}

interface Segment {
  depTime: string;
  arrTime: string;
  duration: string;
  stops: number;
  stopInfo?: string;
  airline: string;
  airlineCode: string;
  flightNo: string;
  aircraft: string;
}

interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  outbound: Segment;
  inbound: Segment;
  badge?: string;
  eco?: boolean;
  seatsLeft?: number;
}

// ─── Mock Data Generator ──────────────────────────────────────────────────────
const AIRLINES = [
  { name: "대한항공", code: "KE", color: "#00256C" },
  { name: "아시아나항공", code: "OZ", color: "#e60000" },
  { name: "에어프랑스", code: "AF", color: "#002157" },
  { name: "루프트한자", code: "LH", color: "#05164d" },
  { name: "핀에어", code: "AY", color: "#4d4dff" },
  { name: "카타르항공", code: "QR", color: "#5c0632" },
];

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateFlights(dateStr: string, inboundStr: string): FlightOffer[] {
  // Use date as seed so same date → same results
  const dateSeed = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seedRand(dateSeed);

  const basePrice = 900000 + Math.floor(rand() * 800000);

  const depHours = [6, 8, 10, 13, 16, 19];
  const durations = ["12시간 30분", "13시간 15분", "14시간 00분", "15시간 20분"];
  const durations2 = ["11시간 45분", "12시간 55분", "13시간 30분", "14시간 10분"];
  const stops = [0, 1, 1, 0, 1, 0];
  const stopInfos = ["", "인천 경유", "도하 경유", "", "헬싱키 경유", ""];

  const flights: FlightOffer[] = [];
  const count = 4 + Math.floor(rand() * 3);

  for (let i = 0; i < count; i++) {
    const r = rand;
    const airlineIdx = Math.floor(r() * AIRLINES.length);
    const airline = AIRLINES[airlineIdx];
    const depH = depHours[Math.floor(r() * depHours.length)];
    const depM = [0, 10, 20, 30, 40, 50][Math.floor(r() * 6)];
    const durIdx = Math.floor(r() * durations.length);
    const dur = durations[durIdx];
    const stopCount = stops[Math.floor(r() * stops.length)];
    const stopInfo = stopCount > 0 ? stopInfos[Math.floor(r() * stopInfos.length)] || "인천 경유" : "";

    // Compute arrival time roughly
    const durHours = parseInt(dur);
    const arrH = (depH + durHours) % 24;
    const nextDay = depH + durHours >= 24;

    const inbAirlineIdx = Math.floor(r() * AIRLINES.length);
    const inbAirline = AIRLINES[inbAirlineIdx];
    const inbDepH = depHours[Math.floor(r() * depHours.length)];
    const inbDepM = [0, 15, 30, 45][Math.floor(r() * 4)];
    const inbDurIdx = Math.floor(r() * durations2.length);
    const inbDur = durations2[inbDurIdx];
    const inbDurH = parseInt(inbDur);
    const inbArrH = (inbDepH + inbDurH) % 24;
    const inbNextDay = inbDepH + inbDurH >= 24;

    const priceVariant = basePrice + Math.floor(r() * 400000) - 200000;
    const price = Math.max(600000, priceVariant);

    const seatsLeft = r() < 0.3 ? Math.ceil(r() * 5) : undefined;
    const eco = r() < 0.25;
    const badge = i === 0 ? "최저가" : r() < 0.2 ? "빠른 도착" : undefined;

    flights.push({
      id: `flight-${dateStr}-${i}`,
      price,
      currency: "KRW",
      outbound: {
        depTime: `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`,
        arrTime: `${String(arrH).padStart(2, "0")}:${String((depM + 30) % 60).padStart(2, "0")}${nextDay ? " +1" : ""}`,
        duration: dur,
        stops: stopCount,
        stopInfo,
        airline: airline.name,
        airlineCode: airline.code,
        flightNo: `${airline.code}${900 + Math.floor(r() * 90)}`,
        aircraft: r() < 0.5 ? "보잉 787" : "에어버스 A380",
      },
      inbound: {
        depTime: `${String(inbDepH).padStart(2, "0")}:${String(inbDepM).padStart(2, "0")}`,
        arrTime: `${String(inbArrH).padStart(2, "0")}:${String((inbDepM + 20) % 60).padStart(2, "0")}${inbNextDay ? " +1" : ""}`,
        duration: inbDur,
        stops: Math.floor(r() * 2),
        stopInfo: r() < 0.4 ? "인천 경유" : "",
        airline: inbAirline.name,
        airlineCode: inbAirline.code,
        flightNo: `${inbAirline.code}${800 + Math.floor(r() * 90)}`,
        aircraft: r() < 0.5 ? "보잉 777" : "에어버스 A350",
      },
      badge,
      eco,
      seatsLeft,
    });
  }

  // Sort by price
  flights.sort((a, b) => a.price - b.price);
  if (flights.length > 0) flights[0].badge = "최저가";
  return flights;
}

// ─── Date utilities ───────────────────────────────────────────────────────────
function formatDateKR(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

// ─── SubComponents ────────────────────────────────────────────────────────────
function AirlineIcon({ code, name }: { code: string; name: string }) {
  const colors: Record<string, string> = {
    KE: "#00256C", OZ: "#e60000", AF: "#002157",
    LH: "#05164d", AY: "#4d4dff", QR: "#5c0632",
  };
  const bg = colors[code] || "#555";
  return (
    <span
      className={styles.airlineIcon}
      style={{ background: bg }}
      title={name}
    >
      {code}
    </span>
  );
}

function StopsBadge({ stops, stopInfo }: { stops: number; stopInfo?: string }) {
  if (stops === 0) {
    return <span className={styles.stopsDirect}>직항</span>;
  }
  return (
    <span className={styles.stopsLayover} title={stopInfo}>
      경유 {stops}회 {stopInfo && `· ${stopInfo}`}
    </span>
  );
}

function FlightSegment({ seg, label }: { seg: Segment; label: string }) {
  return (
    <div className={styles.segmentRow}>
      <div className={styles.segmentLabel}>{label}</div>
      <div className={styles.segmentContent}>
        <AirlineIcon code={seg.airlineCode} name={seg.airline} />
        <div className={styles.segmentTimes}>
          <span className={styles.depTime}>{seg.depTime}</span>
          <div className={styles.timelineBar}>
            <div className={styles.timelineLine} />
            <StopsBadge stops={seg.stops} stopInfo={seg.stopInfo} />
          </div>
          <span className={styles.arrTime}>{seg.arrTime}</span>
        </div>
        <div className={styles.segmentMeta}>
          <span className={styles.flightNo}>{seg.flightNo}</span>
          <span className={styles.duration}>{seg.duration}</span>
          <span className={styles.aircraft}>{seg.aircraft}</span>
        </div>
      </div>
    </div>
  );
}

function FlightCard({ offer, adults }: { offer: FlightOffer; adults: number }) {
  const [expanded, setExpanded] = useState(false);
  const totalPrice = offer.price * adults;

  return (
    <div className={`${styles.card} ${expanded ? styles.cardExpanded : ""}`}>
      {offer.badge && (
        <div className={`${styles.badge} ${offer.badge === "최저가" ? styles.badgeBest : styles.badgeFast}`}>
          {offer.badge}
        </div>
      )}
      {offer.eco && <div className={styles.ecoBadge}>🌿 친환경</div>}
      {offer.seatsLeft && (
        <div className={styles.seatsBadge}>잔여석 {offer.seatsLeft}석</div>
      )}

      <div className={styles.cardMain} onClick={() => setExpanded(!expanded)}>
        <div className={styles.cardFlights}>
          {/* Outbound row */}
          <div className={styles.flightRow}>
            <AirlineIcon code={offer.outbound.airlineCode} name={offer.outbound.airline} />
            <div className={styles.flightTimes}>
              <span className={styles.depTime}>{offer.outbound.depTime}</span>
              <div className={styles.routeLine}>
                <div className={styles.routeLineBar} />
                <StopsBadge stops={offer.outbound.stops} stopInfo={offer.outbound.stopInfo} />
              </div>
              <span className={styles.arrTime}>{offer.outbound.arrTime}</span>
              <span className={styles.durationText}>{offer.outbound.duration}</span>
            </div>
          </div>
          {/* Inbound row */}
          <div className={styles.flightRow}>
            <AirlineIcon code={offer.inbound.airlineCode} name={offer.inbound.airline} />
            <div className={styles.flightTimes}>
              <span className={styles.depTime}>{offer.inbound.depTime}</span>
              <div className={styles.routeLine}>
                <div className={styles.routeLineBar} />
                <StopsBadge stops={offer.inbound.stops} stopInfo={offer.inbound.stopInfo} />
              </div>
              <span className={styles.arrTime}>{offer.inbound.arrTime}</span>
              <span className={styles.durationText}>{offer.inbound.duration}</span>
            </div>
          </div>
        </div>

        <div className={styles.cardPrice}>
          <div className={styles.priceLabel}>1인당</div>
          <div className={styles.priceAmount}>{formatPrice(offer.price)}</div>
          <div className={styles.priceTotal}>{adults}인 합계: {formatPrice(totalPrice)}</div>
          <button className={styles.selectBtn}>선택하기</button>
        </div>
      </div>

      {expanded && (
        <div className={styles.cardDetail}>
          <FlightSegment seg={offer.outbound} label="가는 편" />
          <FlightSegment seg={offer.inbound} label="오는 편" />
        </div>
      )}

      <button
        className={styles.expandToggle}
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? "접기" : "상세 보기"}
      >
        {expanded ? "▲ 접기" : "▼ 상세 보기"}
      </button>
    </div>
  );
}

// ─── Date Price Bar (calendar nav) ───────────────────────────────────────────
function DatePriceBar({
  label,
  currentDate,
  onDateChange,
  dateSeed,
}: {
  label: string;
  currentDate: string;
  onDateChange: (d: string) => void;
  dateSeed: string;
}) {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i - 3));

  return (
    <div className={styles.datePriceBar}>
      <div className={styles.datePriceLabel}>{label}</div>
      <div className={styles.datePriceDates}>
        {dates.map((d) => {
          const seed = d.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
          const baseP = 900000 + (seed % 800000);
          const isSelected = d === currentDate;
          const isWeekend = new Date(d + "T00:00:00").getDay() % 6 === 0;
          return (
            <button
              key={d}
              className={`${styles.dateBtn} ${isSelected ? styles.dateBtnSelected : ""} ${isWeekend ? styles.dateBtnWeekend : ""}`}
              onClick={() => onDateChange(d)}
            >
              <span className={styles.dateBtnDate}>{formatDateShort(d)}</span>
              <span className={styles.dateBtnPrice}>{Math.round(baseP / 10000)}만원~</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Search Header ────────────────────────────────────────────────────────────
const CABIN_LABELS: Record<Cabin, string> = {
  economy: "이코노미",
  business: "비즈니스",
  first: "일등석",
};

function SearchHeader({
  params,
  onParamsChange,
}: {
  params: SearchParams;
  onParamsChange: (p: SearchParams) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(params);

  const handleApply = () => {
    onParamsChange(draft);
    setEditing(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logoArea}>
          <span className={styles.logo}>✈ FlightSearch</span>
        </div>

        {!editing ? (
          <div className={styles.searchSummary} onClick={() => { setDraft(params); setEditing(true); }}>
            <div className={styles.summaryRoute}>
              <span className={styles.summaryAirport}>{params.origin}</span>
              <span className={styles.summaryArrow}>{params.tripType === "round" ? "⇄" : "→"}</span>
              <span className={styles.summaryAirport}>{params.destination}</span>
            </div>
            <div className={styles.summaryDetails}>
              <span>{formatDateShort(params.outbound)}</span>
              {params.tripType === "round" && <><span>·</span><span>{formatDateShort(params.inbound)}</span></>}
              <span>·</span>
              <span>성인 {params.adults}명</span>
              <span>·</span>
              <span>{CABIN_LABELS[params.cabin]}</span>
              <span className={styles.editBtn}>수정</span>
            </div>
          </div>
        ) : (
          <div className={styles.searchForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>출발지</label>
                <input
                  id="origin-input"
                  className={styles.formInput}
                  value={draft.origin}
                  onChange={(e) => setDraft({ ...draft, origin: e.target.value.toUpperCase() })}
                  maxLength={3}
                />
              </div>
              <button
                id="swap-btn"
                className={styles.swapBtn}
                onClick={() => setDraft({ ...draft, origin: draft.destination, destination: draft.origin })}
              >⇄</button>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>도착지</label>
                <input
                  id="destination-input"
                  className={styles.formInput}
                  value={draft.destination}
                  onChange={(e) => setDraft({ ...draft, destination: e.target.value.toUpperCase() })}
                  maxLength={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>가는날</label>
                <input
                  id="outbound-date-input"
                  type="date"
                  className={styles.formInput}
                  value={draft.outbound}
                  onChange={(e) => setDraft({ ...draft, outbound: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>오는날</label>
                <input
                  id="inbound-date-input"
                  type="date"
                  className={styles.formInput}
                  value={draft.inbound}
                  onChange={(e) => setDraft({ ...draft, inbound: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>성인</label>
                <select
                  id="adults-select"
                  className={styles.formInput}
                  value={draft.adults}
                  onChange={(e) => setDraft({ ...draft, adults: Number(e.target.value) })}
                >
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <option key={n} value={n}>{n}명</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>좌석등급</label>
                <select
                  id="cabin-select"
                  className={styles.formInput}
                  value={draft.cabin}
                  onChange={(e) => setDraft({ ...draft, cabin: e.target.value as Cabin })}
                >
                  <option value="economy">이코노미</option>
                  <option value="business">비즈니스</option>
                  <option value="first">일등석</option>
                </select>
              </div>
              <button
                id="search-btn"
                className={styles.searchBtn}
                onClick={handleApply}
              >
                검색
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
type SortKey = "price" | "duration" | "depart";

interface Filters {
  directOnly: boolean;
  sort: SortKey;
  maxPrice: number;
}

function FilterBar({
  filters,
  onChange,
  maxAvailable,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  maxAvailable: number;
}) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarInner}>
        <label className={styles.filterCheck}>
          <input
            id="direct-only-checkbox"
            type="checkbox"
            checked={filters.directOnly}
            onChange={(e) => onChange({ ...filters, directOnly: e.target.checked })}
          />
          <span>직항만</span>
        </label>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>정렬</span>
          {([["price", "가격순"], ["duration", "소요시간순"], ["depart", "출발시간순"]] as [SortKey, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                id={`sort-${key}-btn`}
                className={`${styles.filterChip} ${filters.sort === key ? styles.filterChipActive : ""}`}
                onClick={() => onChange({ ...filters, sort: key })}
              >
                {label}
              </button>
            )
          )}
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>최대 가격</span>
          <input
            id="max-price-range"
            type="range"
            min={600000}
            max={maxAvailable}
            step={50000}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className={styles.priceRange}
          />
          <span className={styles.filterPrice}>{Math.round(filters.maxPrice / 10000)}만원</span>
        </div>
      </div>
    </div>
  );
}

// ─── Trip Details Board ───────────────────────────────────────────────────────
function TripDetailsBoard({
  accommodations,
  setAccommodations,
  attractions,
  setAttractions,
}: {
  accommodations: string[];
  setAccommodations: React.Dispatch<React.SetStateAction<string[]>>;
  attractions: string[];
  setAttractions: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [accInput, setAccInput] = useState("");
  const [attrInput, setAttrInput] = useState("");

  const addAcc = () => {
    if (accInput.trim()) setAccommodations([...accommodations, accInput.trim()]);
    setAccInput("");
  };

  const removeAcc = (idx: number) => {
    setAccommodations(accommodations.filter((_, i) => i !== idx));
  };

  const addAttr = () => {
    if (attrInput.trim()) setAttractions([...attractions, attrInput.trim()]);
    setAttrInput("");
  };

  const removeAttr = (idx: number) => {
    setAttractions(attractions.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.tripBoardWrapper}>
      <div className={styles.tripBoard}>
        <h3 className={styles.tripBoardTitle}>🎒 내 여행 상세 정보</h3>
        
        <div className={styles.tripBoardGrid}>
          {/* Accommodation Section */}
          <div className={styles.tripBoardColumn}>
            <div className={styles.tripBoardHeader}>
              <span className={styles.tripBoardIcon}>🏨</span>
              <span className={styles.tripBoardLabel}>숙소 정보</span>
            </div>
            <div className={styles.tripBoardInputRow}>
              <input
                className={styles.tripBoardInput}
                placeholder="예: 파리 1구 에어비앤비"
                value={accInput}
                onChange={(e) => setAccInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAcc()}
              />
              <button className={styles.tripBoardAddBtn} onClick={addAcc}>추가</button>
            </div>
            <div className={styles.tripBoardList}>
              {accommodations.length === 0 ? (
                <div className={styles.tripBoardEmpty}>등록된 숙소가 없습니다.</div>
              ) : (
                accommodations.map((acc, i) => (
                  <div key={i} className={styles.tripBoardItem}>
                    <div className={styles.tripBoardItemText}>{acc}</div>
                    <button className={styles.tripBoardRemove} onClick={() => removeAcc(i)}>✕</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attractions Section */}
          <div className={styles.tripBoardColumn}>
            <div className={styles.tripBoardHeader}>
              <span className={styles.tripBoardIcon}>📸</span>
              <span className={styles.tripBoardLabel}>관광지 및 일정</span>
            </div>
            <div className={styles.tripBoardInputRow}>
              <input
                className={styles.tripBoardInput}
                placeholder="예: 에펠탑, 루브르 박물관"
                value={attrInput}
                onChange={(e) => setAttrInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAttr()}
              />
              <button className={styles.tripBoardAddBtn} onClick={addAttr}>추가</button>
            </div>
            <div className={styles.tripBoardTags}>
              {attractions.length === 0 ? (
                <div className={styles.tripBoardEmpty}>등록된 관광지가 없습니다.</div>
              ) : (
                attractions.map((attr, i) => (
                  <div key={i} className={styles.tripBoardTag}>
                    {attr}
                    <button className={styles.tripBoardTagRemove} onClick={() => removeAttr(i)}>✕</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DEFAULT_PARAMS: SearchParams = {
  origin: "PUS",
  destination: "CDG",
  outbound: "2026-07-31",
  inbound: "2026-08-11",
  adults: 6,
  cabin: "economy",
  tripType: "round",
};

// ─── Hero Carousel ────────────────────────────────────────────────────────────
const HERO_IMAGES = [
  "/paris1.png",
  "/paris2.png",
  "/paris3.png",
  "/paris4.png",
  "/paris5.png",
  "/paris6.png",
];

function HeroCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.carouselWrapper}>
      {HERO_IMAGES.map((src, idx) => (
        <div
          key={src}
          className={`${styles.carouselSlide} ${idx === currentIdx ? styles.carouselActive : ""}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className={styles.carouselOverlay} />
    </div>
  );
}

export default function FlightSearchClient() {
  const [params, setParams] = useState<SearchParams>(DEFAULT_PARAMS);
  const [filters, setFilters] = useState<Filters>({
    directOnly: false,
    sort: "price",
    maxPrice: 2000000,
  });
  const [loading, setLoading] = useState(false);
  const [prevOutbound, setPrevOutbound] = useState(params.outbound);
  const [prevInbound, setPrevInbound] = useState(params.inbound);

  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [attractions, setAttractions] = useState<string[]>([]);

  const handleParamsChange = useCallback((newParams: SearchParams) => {
    const dateChanged =
      newParams.outbound !== prevOutbound || newParams.inbound !== prevInbound;
    if (dateChanged) {
      setLoading(true);
      setTimeout(() => setLoading(false), 700);
      setPrevOutbound(newParams.outbound);
      setPrevInbound(newParams.inbound);
    }
    setParams(newParams);
  }, [prevOutbound, prevInbound]);

  const handleOutboundChange = useCallback((d: string) => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
    setPrevOutbound(d);
    setParams((p) => ({ ...p, outbound: d }));
  }, []);

  const handleInboundChange = useCallback((d: string) => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
    setPrevInbound(d);
    setParams((p) => ({ ...p, inbound: d }));
  }, []);

  const allFlights = generateFlights(params.outbound, params.inbound);
  const maxPrice = Math.max(...allFlights.map((f) => f.price));

  // Ensure maxPrice filter is valid
  const effectiveMaxPrice = filters.maxPrice < 700000 ? maxPrice : filters.maxPrice;

  let flights = allFlights.filter((f) => {
    if (filters.directOnly && (f.outbound.stops > 0 || f.inbound.stops > 0)) return false;
    if (f.price > effectiveMaxPrice) return false;
    return true;
  });

  if (filters.sort === "price") flights.sort((a, b) => a.price - b.price);
  else if (filters.sort === "depart") {
    flights.sort((a, b) => a.outbound.depTime.localeCompare(b.outbound.depTime));
  } else if (filters.sort === "duration") {
    flights.sort((a, b) => {
      const aH = parseInt(a.outbound.duration);
      const bH = parseInt(b.outbound.duration);
      return aH - bH;
    });
  }

  const minPrice = flights.length > 0 ? Math.min(...flights.map((f) => f.price)) : 0;

  return (
    <div className={styles.root}>
      <SearchHeader params={params} onParamsChange={handleParamsChange} />

      <div className={styles.heroBar}>
        <HeroCarousel />
        <div className={styles.heroBarInner}>
          <div className={styles.heroRoute}>
            <div className={styles.heroAirport}>
              <span className={styles.heroCode}>PUS</span>
              <span className={styles.heroCity}>부산</span>
            </div>
            <div className={styles.heroArrow}>
              <div className={styles.heroArrowLine} />
              <span className={styles.heroArrowIcon}>✈</span>
              <div className={styles.heroArrowLine} />
            </div>
            <div className={styles.heroAirport}>
              <span className={styles.heroCode}>CDG</span>
              <span className={styles.heroCity}>파리 샤를드골</span>
            </div>
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>📅 {formatDateKR(params.outbound)}</span>
            <span className={styles.heroMetaItem}>↩ {formatDateKR(params.inbound)}</span>
            <span className={styles.heroMetaItem}>👥 성인 {params.adults}명</span>
            <span className={styles.heroMetaItem}>💺 {CABIN_LABELS[params.cabin]}</span>
          </div>
          {minPrice > 0 && (
            <div className={styles.heroMinPrice}>
              최저{" "}
              <strong>{formatPrice(minPrice)}</strong>
              <span className={styles.heroMinPriceSub}>/ 1인당 (총 {formatPrice(minPrice * params.adults)})</span>
            </div>
          )}
        </div>
      </div>

      <TripDetailsBoard
        accommodations={accommodations}
        setAccommodations={setAccommodations}
        attractions={attractions}
        setAttractions={setAttractions}
      />

      {/* Date bars */}
      <div className={styles.dateBarsWrapper}>
        <DatePriceBar
          label="가는 날 변경"
          currentDate={params.outbound}
          onDateChange={handleOutboundChange}
          dateSeed={params.outbound}
        />
        <DatePriceBar
          label="오는 날 변경"
          currentDate={params.inbound}
          onDateChange={handleInboundChange}
          dateSeed={params.inbound}
        />
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        maxAvailable={maxPrice}
      />

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingPlane}>✈</div>
            <div className={styles.loadingText}>날짜에 맞는 항공편 검색 중...</div>
            <div className={styles.loadingBars}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={styles.loadingBar} style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : flights.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h2 className={styles.emptyTitle}>검색 결과가 없습니다</h2>
            <p className={styles.emptyDesc}>필터를 조정하거나 다른 날짜를 선택해 보세요.</p>
          </div>
        ) : (
          <>
            <div className={styles.resultsMeta}>
              <span className={styles.resultsCount}>{flights.length}개 항공편 발견</span>
              <span className={styles.resultsDot}>·</span>
              <span className={styles.resultsDate}>{formatDateKR(params.outbound)} 출발</span>
            </div>
            <div className={styles.flightList} role="list" aria-label="항공편 목록">
              {flights.map((offer) => (
                <FlightCard key={offer.id} offer={offer} adults={params.adults} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2026 FlightSearch · 부산↔파리 항공편 검색 서비스 · 실제 예약은 항공사 및 판매사 사이트를 이용해 주세요.</p>
      </footer>
    </div>
  );
}
