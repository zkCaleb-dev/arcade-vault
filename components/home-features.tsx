type FeatureKind = "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";

type Feature = {
  icon: FeatureKind;
  title: string;
  desc: string;
  color: "cyan" | "magenta" | "yellow" | "green";
};

const FEATURES: readonly Feature[] = [
  {
    icon: "GAMEPAD",
    title: "JUEGOS CLÁSICOS",
    desc: "Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.",
    color: "cyan",
  },
  {
    icon: "FREE",
    title: "100% GRATIS",
    desc: "Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.",
    color: "yellow",
  },
  {
    icon: "TROPHY",
    title: "LADDER BOARDS",
    desc: "Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.",
    color: "magenta",
  },
  {
    icon: "ROCKET",
    title: "SIEMPRE CRECIENDO",
    desc: "Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.",
    color: "green",
  },
];

function FeatureIcon({ kind }: { kind: FeatureKind }) {
  const C = "currentColor";

  if (kind === "GAMEPAD")
    return (
      <svg className="ft-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="2" y="6" width="12" height="6" />
          <rect x="0" y="8" width="2" height="4" />
          <rect x="14" y="8" width="2" height="4" />
          <rect x="3" y="8" width="2" height="2" />
          <rect x="2" y="9" width="4" height="0.5" />
          <rect x="11" y="7" width="1.5" height="1.5" />
          <rect x="11" y="10" width="1.5" height="1.5" />
        </g>
      </svg>
    );

  if (kind === "FREE")
    return (
      <svg className="ft-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="3" y="3" width="10" height="10" fill="none" stroke={C} strokeWidth="1.5" />
          <rect x="5" y="6" width="1.5" height="4" />
          <rect x="5" y="6" width="4" height="1.5" />
          <rect x="5" y="8" width="3" height="1" />
          <rect x="10" y="6" width="1.5" height="4" />
        </g>
      </svg>
    );

  if (kind === "TROPHY")
    return (
      <svg className="ft-icon" viewBox="0 0 16 16">
        <g fill={C}>
          <rect x="3" y="2" width="10" height="2" />
          <rect x="3" y="2" width="2" height="6" />
          <rect x="11" y="2" width="2" height="6" />
          <rect x="5" y="8" width="6" height="2" />
          <rect x="7" y="10" width="2" height="3" />
          <rect x="5" y="13" width="6" height="1.5" />
          <rect x="1" y="3" width="2" height="3" />
          <rect x="13" y="3" width="2" height="3" />
        </g>
      </svg>
    );

  return (
    <svg className="ft-icon" viewBox="0 0 16 16">
      <g fill={C}>
        <rect x="7" y="1" width="2" height="2" />
        <rect x="6" y="3" width="4" height="2" />
        <rect x="5" y="5" width="6" height="6" />
        <rect x="4" y="11" width="2" height="2" />
        <rect x="10" y="11" width="2" height="2" />
        <rect x="7" y="6" width="2" height="2" fill="#0a0a0f" />
        <rect x="6" y="13" width="1" height="2" />
        <rect x="9" y="13" width="1" height="2" />
      </g>
    </svg>
  );
}

export default function HomeFeatures() {
  return (
    <>
      <div className="section-head">
        <div className="kicker pixel neon-magenta">{"// 01"}</div>
        <h2 className="section-title">¿POR QUÉ ARCADE VAULT?</h2>
        <div className="section-rule"></div>
      </div>
      <div className="feature-grid">
        {FEATURES.map((f, i) => (
          <div
            key={f.icon}
            className={"feature-card " + f.color}
            style={{ transitionDelay: i * 80 + "ms" }}
          >
            <FeatureIcon kind={f.icon} />
            <div className="ft-title pixel">{f.title}</div>
            <div className="ft-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}
