"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Game } from "@/lib/games";
import { seededScores } from "@/lib/scores";

const DEMO_PLAYER = "PLAYER1";
const DEMO_DATE = "11/05/2026";

export default function HallOfFame({ games }: { games: Game[] }) {
  const [tab, setTab] = useState(games[0].id);
  const rows = useMemo(() => seededScores(tab.length * 23 + 7, 12), [tab]);
  const game = games.find((g) => g.id === tab);

  const demoRank = 8 + (tab.length % 4);
  const demoScore = rows[5].score - 2400;

  return (
    <>
      <div className="hall-tabs">
        {games.map((g) => (
          <button
            key={g.id}
            className={"chip" + (tab === g.id ? " active" : "")}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{rows[1].name}</div>
          <div className="score">{rows[1].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[1].date}</div>
        </div>
        <div className="podium-slot gold">
          <div
            className="pixel"
            style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}
          >
            CAMPEÓN
          </div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          <div className="name">{rows[0].name}</div>
          <div className="score" style={{ fontSize: 20 }}>
            {rows[0].score.toLocaleString("es-ES")}
          </div>
          <div className="date">{rows[0].date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{rows[2].name}</div>
          <div className="score">{rows[2].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[2].date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.name + i}
            className={"tr" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        <div className="tr you-label">▸ TU MEJOR MARCA EN {game?.title}</div>
        <div className="tr you" style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
          <div className="rk" style={{ color: "var(--yellow)" }}>
            #{String(demoRank).padStart(2, "0")}
          </div>
          <div className="pl" style={{ color: "var(--yellow)" }}>
            {DEMO_PLAYER}
          </div>
          <div
            className="sc"
            style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}
          >
            {demoScore.toLocaleString("es-ES")}
          </div>
          <div className="dt">{DEMO_DATE}</div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link className="btn lg" href="/juegos">
          VOLVER A LOS JUEGOS
        </Link>
      </div>
    </>
  );
}
