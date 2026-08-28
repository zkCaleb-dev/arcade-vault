import LibraryBrowser from "@/components/library-browser";
import { CATS, GAMES } from "@/lib/games";

export default function Home() {
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
