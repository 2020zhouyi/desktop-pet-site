import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SitePet } from "../data/types";

const IDLE_DURATION_MS = 6600;

type PetSpriteProps = {
  pet: SitePet;
  priority?: boolean;
  scale?: number;
  staticOnly?: boolean;
};

export function PetSprite({ pet, priority = false, scale = 1, staticOnly = false }: PetSpriteProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [hasRequestedAnimation, setHasRequestedAnimation] = useState(priority);
  const [isAnimatedReady, setIsAnimatedReady] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);

  useEffect(() => {
    if (staticOnly) {
      setIsVisible(false);
      return;
    }

    if (priority) {
      setHasRequestedAnimation(true);
    }

    const frame = frameRef.current;
    if (!frame || typeof IntersectionObserver === "undefined") {
      setHasRequestedAnimation(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
      if (entry.isIntersecting) setHasRequestedAnimation(true);
    }, { rootMargin: "80px 0px" });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [priority, staticOnly]);

  const shouldLoadAnimation = !staticOnly && hasRequestedAnimation;
  const shouldShowAnimation = shouldLoadAnimation && isAnimatedReady;

  return (
    <div
      className="pet-sprite-frame"
      ref={frameRef}
      role="img"
      aria-label={`${cleanPetName(pet.displayName)}待机动画`}
      style={{ "--pet-scale": scale } as CSSProperties}
    >
      <img
        alt=""
        aria-hidden="true"
        className="pet-sprite-poster"
        data-hidden={shouldShowAnimation}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        src={pet.posterUrl}
      />
      {shouldLoadAnimation ? (
        <img
          alt=""
          aria-hidden="true"
          className="pet-sprite-preload"
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setIsAnimatedReady(true)}
          src={pet.spriteUrl}
        />
      ) : null}
      {shouldShowAnimation ? (
        <div
          className="pet-sprite"
          data-running={isVisible}
          style={{
            "--sprite-url": `url("${pet.spriteUrl}")`,
            "--sprite-duration": `${IDLE_DURATION_MS}ms`,
          } as CSSProperties}
        />
      ) : null}
    </div>
  );
}

export function cleanPetName(name: string) {
  return name.replace(/\s+Codex Pet(?:\s+\d+)?$/iu, "");
}
