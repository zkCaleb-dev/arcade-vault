import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fade-in flex flex-col items-center justify-center gap-6 py-32 text-center">
      <div className="pixel neon-magenta flicker text-[42px]">GAME OVER</div>
      <div className="font-mono text-[13px] tracking-[0.16em] text-ink-dim">
        404 · PANTALLA NO ENCONTRADA
      </div>
      <Link className="btn lg magenta" href="/">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
