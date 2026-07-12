import type { CSSProperties } from "react";
import type { SitePet } from "../data/types";

const IDLE_DURATION_MS = 6600;

export function PetSprite({ pet, scale = 1 }: { pet: SitePet; scale?: number }) {
  return (
    <div
      className="pet-sprite-frame"
      role="img"
      aria-label={`${cleanPetName(pet.displayName)}待机动画`}
      style={{ "--pet-scale": scale } as CSSProperties}
    >
      <div
        className="pet-sprite"
        style={{
          "--sprite-url": `url("${pet.spriteUrl}")`,
          "--sprite-duration": `${IDLE_DURATION_MS}ms`,
        } as CSSProperties}
      />
    </div>
  );
}

export function cleanPetName(name: string) {
  return name.replace(/\s+Codex Pet(?:\s+\d+)?$/iu, "");
}
