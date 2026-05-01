import { ConnectButton } from "@rainbow-me/rainbowkit";
import { timeControls, wagerOptions } from "@/lib/game-config";

export function LobbyPanel() {
    return (
        <section className="panel compact-panel">
          <div className="panel-head">
            <p className="eyebrow">TOKEN LOBBY RULES</p>
            <h2>C4C wager configuration</h2>
          </div>
    
          <div className="stack-list">
            <div>
              <strong>Stake ladder</strong>
              <p>{wagerOptions.map((value) => value.toLocaleString()).join(" / ")} C4C</p>
            </div>
            <div>
              <strong>Time controls</strong>
              <p>{timeControls.map((value) => `${value} min`).join(" / ")}</p>
            </div>
            <div>
              <strong>Wallet flow</strong>
              <p>Players connect wallet, create a room, join live, and prepare token staking.</p>
            </div>
          </div>
    
          <div className="wallet-row">
            <ConnectButton />
          </div>
        </section>
      );
    }
    
    