import { ArrowLeft, ArrowRight, ChevronRight, Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { SitePet } from "../data/types";
import { cleanPetName, PetSprite } from "./PetSprite";

const HERO_PET_IDS = [
  "player-01",
  "player-02",
  "boss-04",
  "player-04",
  "jx3-u4e03-u79c0-01",
];
const HERO_TRANSITION_MS = 650;
type Direction = "next" | "prev";
type Role = "center" | "left" | "right" | "far-left" | "far-right";

export function HeroPetCarousel({ pets }: { pets: SitePet[] }) {
  const heroPets = useMemo(() => {
    const selected = HERO_PET_IDS
      .map((id) => pets.find((pet) => pet.id === id))
      .filter((pet): pet is SitePet => Boolean(pet));
    return selected.length === 5 ? selected : pets.slice(0, 5);
  }, [pets]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<number | null>(null);
  const activePet = heroPets[activeIndex] ?? heroPets[0];

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  if (!activePet) return null;

  const navigate = (direction: Direction) => {
    if (isAnimating) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setActiveIndex((current) => (
      direction === "next"
        ? (current + 1) % heroPets.length
        : (current + heroPets.length - 1) % heroPets.length
    ));
    if (reduceMotion) return;
    setIsAnimating(true);
    timerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      timerRef.current = null;
    }, HERO_TRANSITION_MS);
  };

  const style = {
    "--hero-accent": activePet.theme.accent,
    "--hero-soft": activePet.theme.accentSoft,
    "--hero-ink": activePet.theme.accentDeep,
  } as CSSProperties;

  return (
    <section className="pixel-hero" data-animating={isAnimating} id="top" style={style} aria-labelledby="hero-title">
      <div className="pixel-noise" aria-hidden="true" />
      <div className="pixel-grid" aria-hidden="true" />
      <p className="pixel-ghost" aria-hidden="true">剑三小宠物</p>

      <div className="hero-pet-stage" aria-label="桌宠待机动画轮播">
        <span className="pixel-floor" aria-hidden="true" />
        {heroPets.map((pet, index) => (
          <div
            className={`hero-pet hero-pet--${getRole(index, activeIndex, heroPets.length)}`}
            key={pet.id}
            aria-hidden={index !== activeIndex}
          >
            <PetSprite pet={pet} priority={index === activeIndex} staticOnly={index !== activeIndex} />
          </div>
        ))}
      </div>

      <div className="pixel-hero-content">
        <div className="hero-copy">
          <p className="hero-kicker">DESKTOP COMPANION · JX3</p>
          <h1 id="hero-title"><span>能陪伴你的</span><span>剑三小宠物</span></h1>
          <p className="hero-description">常驻电脑桌面，安静陪你。</p>
          <div className="hero-actions">
            <a className="button primary" href="#download"><i className="button-status" aria-hidden="true" /><Download size={17} />下载桌宠</a>
            <a className="button secondary" href="#pets">浏览图鉴<ChevronRight size={17} /></a>
          </div>
        </div>

        <div className="hero-carousel-meta" aria-live="polite">
          <div className="hero-pet-name">
            <span>当前陪伴</span>
            <strong>{cleanPetName(activePet.displayName)}</strong>
            <small>{String(activeIndex + 1).padStart(2, "0")} / {String(heroPets.length).padStart(2, "0")}</small>
          </div>
          <div className="hero-carousel-controls" aria-label="切换首屏角色">
            <button aria-label="上一个角色" disabled={isAnimating} onClick={() => navigate("prev")} type="button"><ArrowLeft /></button>
            <button aria-label="下一个角色" disabled={isAnimating} onClick={() => navigate("next")} type="button"><ArrowRight /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function getRole(index: number, activeIndex: number, count: number): Role {
  if (index === activeIndex) return "center";
  if (index === (activeIndex + count - 1) % count) return "left";
  if (index === (activeIndex + 1) % count) return "right";
  if (index === (activeIndex + count - 2) % count) return "far-left";
  return "far-right";
}
