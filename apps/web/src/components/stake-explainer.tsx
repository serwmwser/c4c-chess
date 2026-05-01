import Link from "next/link";

export function StakeExplainer() {
    return (
        <div className="stake-ribbon">
          <div>
            <span>Stake range</span>
            <strong>50,000 to 1,000,000 C4C</strong>
          </div>
          <div>
            <span>Increment</span>
            <strong>50,000 C4C</strong>
          </div>
          <div>
            <span>Token</span>
            <Link href="https://www.pink.meme/token/bsc/0xaac20575371de01b4d10c4e7566d5453d72d56e7">
              C4C market page
            </Link>
          </div>
        </div>
      );
    }
    
    