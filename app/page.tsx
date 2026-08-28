import Link from "next/link";
import HomeActivity from "@/components/home-activity";
import HomeFeatures from "@/components/home-features";
import HomeHero from "@/components/home-hero";
import HomePricing from "@/components/home-pricing";
import HomeRail from "@/components/home-rail";
import HomeStats from "@/components/home-stats";
import Reveal from "@/components/reveal";

export default function Home() {
  return (
    <div className="home fade-in">
      <HomeHero />

      <Reveal className="home-section">
        <HomeFeatures />
      </Reveal>

      <Reveal className="home-section">
        <HomeRail />
      </Reveal>

      <Reveal className="home-stats">
        <HomeStats />
      </Reveal>

      <Reveal className="home-section">
        <HomeActivity />
      </Reveal>

      <Reveal className="home-section">
        <HomePricing />
      </Reveal>

      <Reveal className="home-final">
        <h2 className="final-title pixel">¿LISTO PARA JUGAR?</h2>
        <Link className="btn xl pulse final-cta" href="/juegos">
          INSERTAR MONEDA →
        </Link>
        <div className="final-tag">Gratis. Sin registro obligatorio. Empieza en segundos.</div>
      </Reveal>
    </div>
  );
}
