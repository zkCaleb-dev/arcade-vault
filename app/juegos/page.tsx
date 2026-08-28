import type { Metadata } from "next";
import LibraryBrowser from "@/components/library-browser";
import { CATS, GAMES } from "@/lib/games";

export const metadata: Metadata = {
  title: "Juegos · Arcade Vault",
  description: "El catálogo completo del Vault. Busca, filtra y elige tu clásico.",
};

export default function GamesPage() {
  return (
    <div className="fade-in">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>

      <LibraryBrowser games={GAMES} cats={CATS} />
    </div>
  );
}
