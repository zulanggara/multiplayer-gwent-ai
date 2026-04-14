import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="space-y-2">
          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-[0.15em] gold-shimmer drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
            GWENT
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500" />
            <p className="font-display text-sm text-amber-300/80 tracking-[0.3em]">
              THE WITCHER CARD GAME
            </p>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        </div>

        <p className="text-amber-100/70 text-sm md:text-base font-serif italic max-w-md mx-auto">
          Build a deck, command armies, and outwit your opponent. Victor of two rounds wins the match.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <Link
            href="/local"
            className="group panel-leather rounded-lg p-6 transition-all text-left hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(245,200,114,0.2)]"
          >
            <div className="text-3xl mb-2">⚔️</div>
            <h3 className="font-display text-amber-200 text-lg tracking-widest group-hover:text-amber-300">
              LOCAL MULTIPLAYER
            </h3>
            <p className="text-amber-100/60 text-sm mt-1 font-serif">
              Two players, one device. Alternate turns with hidden hands.
            </p>
          </Link>
          <Link
            href="/online"
            className="group panel-leather rounded-lg p-6 transition-all text-left hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(245,200,114,0.2)]"
          >
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-display text-amber-200 text-lg tracking-widest group-hover:text-amber-300">
              ONLINE MULTIPLAYER
            </h3>
            <p className="text-amber-100/60 text-sm mt-1 font-serif">
              Create or join a room and duel across devices.
            </p>
          </Link>
        </div>

        <div className="pt-8 text-[10px] text-amber-200/30 font-display tracking-[0.3em]">
          INSPIRED BY GWENT CLASSIC · FAN PROJECT
        </div>
      </div>
    </main>
  );
}
