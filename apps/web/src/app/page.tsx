import { AuthGate } from "@/components/auth-gate";
import { CreateGameForm } from "@/components/create-game-form";
import { LiveGame } from "@/components/live-game";
import { LobbyPanel } from "@/components/lobby-panel";
import { ProfileCard } from "@/components/profile-card";
import { RoomList } from "@/components/room-list";
import { StakeExplainer } from "@/components/stake-explainer";

export default function HomePage() {
  return (
    <main className="page-shell app-shell">
      <section className="hero-panel hero-panel-app">
        <div>
          <p className="eyebrow">C4C CHESS ARENA</p>
          <h1>Connect your wallet, open a room, and play live online chess.</h1>
          <p className="hero-copy">
            Enter through your crypto wallet, choose a free match or a C4C stake
            battle, create a room, and play online against another player.
          </p>
          <StakeExplainer />
        </div>
        <ProfileCard />
      </section>

      <AuthGate>
        <section className="content-grid app-grid">
          <CreateGameForm />
          <RoomList />
          <LiveGame />
          <LobbyPanel />
        </section>
      </AuthGate>
    </main>
  );
}
