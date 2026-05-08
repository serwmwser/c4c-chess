'use client'

interface ChessTimerDisplayProps {
  playerTime: string
  opponentTime: string
  activePlayer: 'player' | 'opponent'
  isGameOver: boolean
  winner: 'player' | 'opponent' | 'draw' | null
  playerLabel?: string
  opponentLabel?: string
}

export default function ChessTimerDisplay({
  playerTime, opponentTime, activePlayer, isGameOver, winner,
  playerLabel = 'Вы', opponentLabel = 'Оппонент'
}: ChessTimerDisplayProps) {
  const isActive = (who: 'player' | 'opponent') => activePlayer === who && !isGameOver
  const isLowTime = (timeStr: string) => {
    const [mins] = timeStr.split(':').map(Number)
    return mins < 1
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 200, margin: '0 auto 16px' }}>
      {/* Таймер оппонента */}
      <div style={{
        padding: '8px 12px',
        background: isActive('opponent') ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#1a1a2e',
        borderRadius: 8,
        border: isActive('opponent') ? '2px solid #ffd700' : '1px solid #333',
        opacity: isGameOver && winner !== 'opponent' ? 0.6 : 1
      }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span>{opponentLabel}</span>
          {isActive('opponent') && <span>Ходит</span>}
          {winner === 'opponent' && <span>Победа</span>}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: isLowTime(opponentTime) && !isGameOver ? '#ff4444' : '#fff' }}>
          {opponentTime}
        </div>
      </div>
      {/* Таймер игрока */}
      <div style={{
        padding: '8px 12px',
        background: isActive('player') ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#1a1a2e',
        borderRadius: 8,
        border: isActive('player') ? '2px solid #ffd700' : '1px solid #333',
        opacity: isGameOver && winner !== 'player' ? 0.6 : 1
      }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span>{playerLabel}</span>
          {isActive('player') && <span>Ходит</span>}
          {winner === 'player' && <span>Победа</span>}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: isLowTime(playerTime) && !isGameOver ? '#ff4444' : '#fff' }}>
          {playerTime}
        </div>
      </div>
      {isGameOver && (
        <div style={{ textAlign: 'center', padding: 8, background: winner === 'draw' ? '#666' : winner ? '#22c55e' : '#ef4444', borderRadius: 6, fontSize: 14, fontWeight: 600, marginTop: 4 }}>
          {winner === 'draw' ? 'Ничья' : winner === 'player' ? 'Вы победили!' : 'Поражение'} {winner && '(по времени)'}
        </div>
      )}
    </div>
  )
}
