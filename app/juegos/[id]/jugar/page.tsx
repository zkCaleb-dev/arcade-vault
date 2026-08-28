import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GamePlayer from "@/components/game-player";
import { GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata(
  props: PageProps<"/juegos/[id]/jugar">,
): Promise<Metadata> {
  const { id } = await props.params;
  const game = getGame(id);
  if (!game) return { title: "Juego no encontrado · Arcade Vault" };
  return { title: `Jugando a ${game.title} · Arcade Vault`, description: game.short };
}

export default async function GamePlayerPage(props: PageProps<"/juegos/[id]/jugar">) {
  const { id } = await props.params;
  const game = getGame(id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
