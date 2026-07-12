import { ChevronLeft, ChevronRight, Download, Monitor } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { HeroPetCarousel } from "./components/HeroPetCarousel";
import { cleanPetName, PetSprite } from "./components/PetSprite";
import { UserGuideDialog } from "./components/UserGuideDialog";
import { featuredPets } from "./data/pets.generated";
import { downloadTargets } from "./data/downloads";
import type { SitePet } from "./data/types";

const TRANSITION_MS = 720;
const PROJECT_REPOSITORY_URL = "https://github.com/2020zhouyi/desktop-pet";
type CategoryFilter = "all" | SitePet["category"];

function App() {
  return (
    <main>
      <SiteHeader />
      <HeroPetCarousel pets={featuredPets} />

      <PetGallery pets={featuredPets} />
      <DownloadSection />

      <footer className="site-footer">
        <strong>剑三小桌宠</strong>
        <div className="footer-meta">
          <a href={PROJECT_REPOSITORY_URL} rel="noreferrer" target="_blank"><GitHubMark size={16} />GitHub</a>
          <p>《剑网3》同人衍生作品，非官方授权。角色及相关设定版权归原权利方所有。</p>
        </div>
      </footer>
    </main>
  );
}

function PetGallery({ pets }: { pets: SitePet[] }) {
  const pageSize = useResponsivePageSize();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(0);
  const [currentPets, setCurrentPets] = useState(() => pets.slice(0, pageSize));
  const [outgoingPets, setOutgoingPets] = useState<SitePet[] | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const filteredPets = useMemo(
    () => category === "all" ? pets : pets.filter((pet) => pet.category === category),
    [category, pets],
  );
  const pageCount = Math.max(1, Math.ceil(filteredPets.length / pageSize));
  const counts = useMemo(() => ({
    all: pets.length,
    sects: pets.filter((pet) => pet.category === "sects").length,
    players: pets.filter((pet) => pet.category === "players").length,
    bosses: pets.filter((pet) => pet.category === "bosses").length,
  }), [pets]);
  const filters: Array<{ id: CategoryFilter; label: string }> = [
    { id: "all", label: "全部" }, { id: "sects", label: "门派" },
    { id: "players", label: "玩家" }, { id: "bosses", label: "首领" },
  ];

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const nextFiltered = category === "all" ? pets : pets.filter((pet) => pet.category === category);
    setPage(0);
    setOutgoingPets(null);
    setCurrentPets(nextFiltered.slice(0, pageSize));
    setTransitioning(false);
  }, [pageSize, pets, category]);

  const transitionTo = (nextPets: SitePet[], nextPage: number, nextDirection: 1 | -1) => {
    if (transitioning) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setDirection(nextDirection);
    setPage(nextPage);
    if (reduceMotion) {
      setCurrentPets(nextPets);
      setOutgoingPets(null);
      return;
    }
    setOutgoingPets(currentPets);
    setCurrentPets(nextPets);
    setTransitioning(true);
    timerRef.current = window.setTimeout(() => {
      setOutgoingPets(null);
      setTransitioning(false);
      timerRef.current = null;
    }, TRANSITION_MS);
  };

  const showPage = (target: number) => {
    if (target === page || target < 0 || target >= pageCount) return;
    transitionTo(
      filteredPets.slice(target * pageSize, target * pageSize + pageSize),
      target,
      target > page ? 1 : -1,
    );
  };

  const selectCategory = (nextCategory: CategoryFilter) => {
    if (nextCategory === category || transitioning) return;
    setCategory(nextCategory);
  };

  return (
    <section className="gallery section-wrap" id="pets" aria-labelledby="pets-title">
      <div className="section-heading"><h2 id="pets-title">角色图鉴</h2></div>
      <div className="gallery-toolbar">
        <div className="category-tabs" aria-label="角色分类">
          {filters.map((filter) => (
            <button aria-pressed={category === filter.id} key={filter.id} onClick={() => selectCategory(filter.id)} type="button">
              {filter.label}<span>{counts[filter.id]}</span>
            </button>
          ))}
        </div>
        <span className="page-index" aria-live="polite">{pad(page + 1)} / {pad(pageCount)}</span>
      </div>

      <div className="pet-stage-stack" data-direction={direction} data-transitioning={transitioning}>
        {outgoingPets ? <PetLayer className="pet-layer pet-layer-outgoing" pets={outgoingPets} /> : null}
        <PetLayer className="pet-layer pet-layer-incoming" pets={currentPets} />
      </div>

      <div className="page-controls" aria-label="角色分组切换">
        <button aria-label="上一组角色" disabled={page === 0 || transitioning} onClick={() => showPage(page - 1)} type="button"><ChevronLeft /></button>
        <div className="page-dots">
          {Array.from({ length: pageCount }, (_, index) => (
            <button aria-label={`查看第 ${index + 1} 组角色`} aria-current={page === index ? "page" : undefined} disabled={transitioning} key={index} onClick={() => showPage(index)} type="button" />
          ))}
        </div>
        <button aria-label="下一组角色" disabled={page === pageCount - 1 || transitioning} onClick={() => showPage(page + 1)} type="button"><ChevronRight /></button>
      </div>
    </section>
  );
}

function PetLayer({ className, pets }: { className: string; pets: SitePet[] }) {
  return (
    <div className={className}>
      {pets.map((pet, index) => (
        <article
          className="pet-card"
          key={pet.id}
          style={{
            "--pet-index": index,
            "--pet-accent": pet.theme.accent,
            "--pet-accent-soft": pet.theme.accentSoft,
            "--pet-accent-deep": pet.theme.accentDeep,
          } as CSSProperties}
        >
          <div className="pet-card-stage">
            <span className="pet-ground" aria-hidden="true" />
            <PetSprite pet={pet} scale={0.78} />
          </div>
          <div className="pet-card-copy">
            <div className="pet-card-title"><h3>{cleanPetName(pet.displayName)}</h3><span>{pet.categoryLabel}</span></div>
            <a
              aria-label={`下载${cleanPetName(pet.displayName)}角色包`}
              className="pet-card-download"
              download={`${cleanPetName(pet.displayName)}.zip`}
              href={pet.downloadUrl}
              title="下载可导入桌宠的角色包"
            ><Download size={14} /></a>
          </div>
        </article>
      ))}
    </div>
  );
}

function DownloadSection() {
  const targets = downloadTargets.filter((target) => target.label !== "Linux");
  return (
    <section className="download-section" id="download">
      <div className="section-wrap download-layout">
        <div className="download-heading"><h2>下载剑三小桌宠</h2><UserGuideDialog /></div>
        <div className="download-list">
          {targets.map((target) => (
            <article key={target.label}>
              <Monitor size={25} />
              <div><h3>{target.label}</h3><p>{target.label === "macOS" ? "DMG · Apple Silicon" : "EXE · Windows x64"}</p></div>
              {target.href ? <a href={target.href}>立即下载<ChevronRight size={16} /></a> : <span>准备中</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" shapeRendering="crispEdges">
            <path d="M6 8h4V4h4v4h4V4h4v4h4v18H6z" fill="currentColor" />
            <path d="M10 12h12v10H10z" fill="var(--paper)" />
            <path d="M12 14h3v3h-3zm5 0h3v3h-3zm-3 5h4v2h-4z" fill="currentColor" />
          </svg>
        </span>
        <span>剑三小桌宠</span>
      </a>
      <nav aria-label="主导航"><a href="#pets">图鉴</a><a href="#download">下载</a></nav>
      <div className="header-actions">
        <a className="header-download" href="#download"><Download size={16} />下载</a>
        <a aria-label="在 GitHub 查看项目" className="github-link" href={PROJECT_REPOSITORY_URL} rel="noreferrer" target="_blank"><GitHubMark size={18} /></a>
      </div>
    </header>
  );
}

function useResponsivePageSize() {
  const getSize = () => {
    if (typeof window === "undefined") return 10;
    if (window.matchMedia("(max-width: 680px)").matches) return 4;
    if (window.matchMedia("(max-width: 1024px)").matches) return 8;
    return 10;
  };
  const [size, setSize] = useState(getSize);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 680px)");
    const tablet = window.matchMedia("(max-width: 1024px)");
    const update = () => setSize(mobile.matches ? 4 : tablet.matches ? 8 : 10);
    mobile.addEventListener("change", update);
    tablet.addEventListener("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);
  return size;
}

function pad(value: number) { return String(value).padStart(2, "0"); }

function GitHubMark({ size }: { size: number }) {
  return (
    <svg aria-hidden="true" fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.72 0-1.26.45-2.3 1.2-3.1-.12-.3-.52-1.47.11-3.06 0 0 .98-.31 3.16 1.18a10.94 10.94 0 0 1 5.76 0c2.18-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.75.8 1.2 1.84 1.2 3.1 0 4.44-2.7 5.42-5.28 5.71.42.36.79 1.07.79 2.16v3.03c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

export default App;
