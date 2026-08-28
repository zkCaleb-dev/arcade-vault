import type { Metadata } from "next";
import HallOfFame from "@/components/hall-of-fame";
import { GAMES } from "@/lib/games";

export const metadata: Metadata = {
  title: "Salón de la Fama · Arcade Vault",
  description: "Los nombres que nunca se borran de la pantalla.",
};

export default function HallOfFamePage() {
  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <HallOfFame games={GAMES} />
    </div>
  );
}
