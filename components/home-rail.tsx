import Link from "next/link";
import { GAMES } from "@/lib/games";

export default function HomeRail() {
  return (
    <>
      <div className="section-head">
        <div className="kicker pixel neon-cyan">{"// 02"}</div>
        <h2 className="section-title">JUEGOS DISPONIBLES AHORA</h2>
        <div className="section-rule"></div>
      </div>
      <div className="mini-rail">
        {GAMES.slice(0, 6).map((g) => (
          <Link key={g.id} className="mini-card" href={`/juegos/${g.id}`}>
            <div className="mini-cover">
              <div className={"cover-bg " + g.cover}></div>
            </div>
            <div className="mini-meta">
              <div className="mini-title">{g.title}</div>
              <div className="mini-cat">{g.cat}</div>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link className="btn lg" href="/juegos">
          VER TODOS LOS JUEGOS →
        </Link>
      </div>
    </>
  );
}
