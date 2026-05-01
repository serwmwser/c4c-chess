const board = [
  ["bR", "", "", "", "bK", "", "", "bR"],
  ["bP", "bP", "", "bQ", "", "bP", "bP", ""],
  ["", "", "bN", "", "", "", "", "bP"],
  ["", "", "", "bP", "wP", "", "", ""],
  ["", "", "wB", "", "", "", "", ""],
  ["", "", "", "", "wN", "", "", ""],
  ["wP", "wP", "", "", "", "wP", "wP", "wP"],
  ["wR", "", "", "wQ", "wK", "", "", "wR"],
];

export function BoardPreview() {
    return (
        <div className="board-card">
          <div className="board-header">
            <span>Featured board</span>
            <span>Live wagering enabled</span>
          </div>
          <div className="board-grid" aria-label="Chess board preview">
            {board.flatMap((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const dark = (rowIndex + colIndex) % 2 === 1;
                return (
                  <div
                    className={`square ${dark ? "dark" : "light"}`}
                    key={`${rowIndex}-${colIndex}`}
                  >
                    <span>{piece}</span>
                  </div>
                );
              }),
            )}
          </div>
          <div className="board-footer">
            <div>
              <strong>Blitz stake</strong>
              <p>300,000 C4C total pot</p>
            </div>
            <div>
              <strong>Time control</strong>
              <p>30 minutes per side</p>
            </div>
          </div>
        </div>
      );
    }
  
    