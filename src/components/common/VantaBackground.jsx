import { useEffect, useRef } from "react";
import "./VantaBackground.css";

// Each effect loads only when it is used. Change EFFECT below to try another.
const EFFECTS = {
  halo: {
    load: () => import("vanta/dist/vanta.halo.min"),
    options: { backgroundColor: 0x05060a, baseColor: 0x0b2a7a, color2: 0x4b6cff, size: 0.9, amplitudeFactor: 0.9, xOffset: 0.05, yOffset: 0, speed: 0.3 },
  },
  net: {
    load: () => import("vanta/dist/vanta.net.min"),
    options: { color: 0x6ea8fe, backgroundColor: 0x05060a, points: 8, maxDistance: 22, spacing: 18, showDots: true },
  },
};
const EFFECT = "halo";

// A slow animated background behind the landing page. Three.js and Vanta load on demand, only on wide screens and
// only for viewers who have not asked for reduced motion. Anywhere else the plain dark backdrop stays.
export default function VantaBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 699px)").matches;
    if (calm || narrow || !ref.current) return undefined;

    let effect = null;
    let cancelled = false;
    const { load, options } = EFFECTS[EFFECT];
    Promise.all([import("three"), load()])
      .then(([THREE, mod]) => {
        if (cancelled || !ref.current) return;
        // The bundle is a UMD file, so the effect function sits one or two "default"s deep depending on the bundler.
        const create = [mod, mod.default, mod.default?.default].find((candidate) => typeof candidate === "function");
        effect = create({
          el: ref.current,
          THREE,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          ...options,
        });
        ref.current?.classList.add("is-ready");
      })
      .catch((error) => console.error("Animated background did not load", error));

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return <div className="vanta-bg" ref={ref} aria-hidden="true" />;
}
