'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Chess from 'chess.js'
import { createNotification, formatC4C, formatPrizePool, formatTime, getLobbyGames } from '@/lib/config'

const PIECES: Record<string, { w: string; b: string }> = {
  p: { w: '♙', b: '♟' },
  n: { w: '♘', b: '♞' },
  b: { w: '♗', b: '♝' },
  r: { w: '♖', b: '♜' },
  q: { w: '♕', b: '♛' },
  k: { w: '♔', b: '♚' }
}

const getPieceSymbol = (piece: any) => {
  if (!piece || !piece.type || !piece.color) return ''
  const type = piece.type as keyof typeof PIECES
  const color = piece.color as 'w' | 'b'
  return PIECES[type]?.[color] || ''
}

interface GameLobby {
  id: string
  creator: string
  stake: number
  timeCtrl?: number
  timeControl?: number
  status: string
  balance: number
  players: string[]
  startAt?: number
  myColor?: 'w' | 'b'
}

interface ChessClock {
  white: number
  black: number
  turn: 'w' | 'b'
  running: boolean
  finished: boolean
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params?.id as string | undefined

  const [game, setGame] = useState<GameLobby | null>(null)
  const [chess, setChess] = useState<Chess | null>(null)
  const [fen, setFen] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [over, setOver] = useState<string | null>(null)
  const [clock, setClock] = useState<ChessClock | null>(null)
  const [statusLabel, setStatusLabel] = useState('Ожидание ходов...')
  const boardRef = useRef<HTMLDivElement>(null)
  const boardInstance = useRef<any>(null)

  const timeControl = useMemo(() => {
    if (!game) return 900
    return game.timeCtrl || game.timeControl || 900
  }, [game])

  useEffect(() => {
    // Add chessboard CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://chessboardjs.com/css/chessboard-1.0.0.min.css'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    if (!gameId) return
    const storedGames = getLobbyGames()
    const found = storedGames.find((item: any) => item.id === gameId) as GameLobby | undefined
    if (found) {
      setGame(found)
      const board = new Chess()
      setChess(board)
      setFen(board.fen())
      setClock({
        white: found.timeCtrl || found.timeControl || 900,
        black: found.timeCtrl || found.timeControl || 900,
        turn: 'w',
        running: false,
        finished: false
      })
      setStatusLabel(found.status === 'active' ? 'Игра началась' : 'Ожидается соперник')

      // Initialize chessboard
      if (boardRef.current && typeof window !== 'undefined') {
        import('chessboardjs').then((Chessboard) => {
          boardInstance.current = Chessboard.default(boardRef.current as HTMLElement, {
            position: board.fen(),
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: false,
            onDrop: (source: string, target: string) => {
              const move = board.move({ from: source, to: target, promotion: 'q' })
              if (move) {
                setFen(board.fen())
                setMoveHistory((prev) => [...prev, move.san])
                setStatusLabel(board.in_checkmate() ? 'Мат!' : board.in_check() ? 'Шах!' : 'Ход сделан')
                setClock((prev) => {
                  if (!prev) return prev
                  return {
                    ...prev,
                    turn: prev.turn === 'w' ? 'b' : 'w',
                    running: true
                  }
                })
                if (board.in_checkmate()) {
                  setOver(`🏆 Мат! Победа ${move.color === 'w' ? 'Белых' : 'Чёрных'}`)
                } else if (board.in_draw()) {
                  setOver('♟️ Ничья')
                }
                boardInstance.current.position(board.fen())
                return 'snapback'
              } else {
                return 'snapback'
              }
            }
          })
        })
      }
    }
  }, [gameId])

  useEffect(() => {
    // Add chessboard CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://chessboardjs.com/css/chessboard-1.0.0.min.css'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const movePiece = (square: string) => {
    // Removed: now using chessboard onDrop
  }

  const restartGame = () => {
    if (!chess) return
    chess.reset()
    setFen(chess.fen())
    setSelected(null)
    setPossibleMoves([])
    setMoveHistory([])
    setOver(null)
    setStatusLabel('Игра перезапущена')
    setClock({ white: timeControl, black: timeControl, turn: 'w', running: false, finished: false })
    if (boardInstance.current) {
      boardInstance.current.position(chess.fen())
    }
  }

  if (!game) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: 20 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, background: 'var(--card)', borderRadius: 16 }}>
          <h1>♟️ Игра не найдена</h1>
          <p style={{ opacity: 0.75, marginBottom: 16 }}>Не удалось найти игру по идентификатору.</p>
          <button onClick={() => router.push('/')} style={{ padding: '10px 16px', background: 'var(--accent)', color: '#000', borderRadius: 8, border: 'none' }}>Вернуться в лобби</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: 20 }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, background: 'var(--card)', padding: 20, borderRadius: 16 }}>
            <h1 style={{ marginBottom: 12 }}>♟️ Игра {game.id.slice(0, 8)}...</h1>
            <p style={{ marginBottom: 10, opacity: 0.75 }}>{statusLabel}</p>
            <p style={{ marginBottom: 6 }}>💰 Ставка: {game.stake.toLocaleString()} C4C</p>
            <p style={{ marginBottom: 6 }}>🏆 Фонд: {formatPrizePool(game.stake)}</p>
            <p style={{ marginBottom: 6 }}>💼 Баланс в игре: {game.balance.toLocaleString()} C4C</p>
            <p style={{ marginBottom: 6 }}>⏱️ Таймконтроль: {formatTime(timeControl)}</p>
            <p style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>Игроки: {game.players.length > 0 ? game.players.map((p) => p.slice(0, 8)).join(' / ') : 'Ожидание'}</p>
          </div>
          <div style={{ flex: 1, minWidth: 260, background: 'var(--card)', padding: 20, borderRadius: 16 }}>
            <h2 style={{ marginBottom: 12 }}>⏳ Часы</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <span>⚪ Белые</span>
                <strong>{clock ? formatClock(clock.white) : formatClock(timeControl)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <span>⚫ Чёрные</span>
                <strong>{clock ? formatClock(clock.black) : formatClock(timeControl)}</strong>
              </div>
              <button onClick={() => setClock((prev) => prev ? { ...prev, running: !prev.running } : prev)} style={{ padding: '12px 14px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                {clock?.running ? 'Пауза часов' : 'Запустить часы'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 20, alignItems: 'start' }}>
          <div style={{ background: 'var(--card)', padding: 20, borderRadius: 16 }}>
            <div ref={boardRef} style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}></div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={restartGame} style={{ padding: '12px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>🔄 Перезапустить</button>
              <button onClick={() => router.push('/')} style={{ padding: '12px 14px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>← Вернуться в лобби</button>
            </div>
            {over && <div style={{ marginTop: 14, padding: 14, background: '#111827', borderRadius: 10, color: '#fef2f2' }}>{over}</div>}
          </div>

          <div style={{ background: 'var(--card)', padding: 20, borderRadius: 16 }}>
            <h2 style={{ marginBottom: 12 }}>📜 Ходы</h2>
            <div style={{ minHeight: 260, display: 'grid', gap: 10 }}>
              {moveHistory.length === 0 ? (
                <p style={{ opacity: 0.7 }}>Ходы ещё не сделаны.</p>
              ) : (
                moveHistory.map((move, index) => (
                  <div key={`${move}-${index}`} style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                    <strong>{index + 1}.</strong> {move}
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: 20 }}>
              <button onClick={() => {
                createNotification({
                  type: 'claim_ready',
                  title: '🏆 Забрать выигрыш',
                  message: `Запрос на выплату для игры ${game.id.slice(0, 8)}...`,
                  gameId: game.id,
                  read: false,
                  createdAt: Date.now()
                })
                alert('✅ Запрос на выплату отправлен. Проверяйте лобби.')
              }} style={{ width: '100%', padding: '12px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                🏆 Забрать выигрыш
              </button>
              <button onClick={() => {
                createNotification({
                  type: 'invite',
                  title: '♟️ Ничья предложена',
                  message: `Предложение ничьей в игре ${game.id.slice(0, 8)}...`,
                  gameId: game.id,
                  read: false,
                  createdAt: Date.now()
                })
                alert('✅ Предложение ничьей отправлено.')
              }} style={{ width: '100%', marginTop: 10, padding: '12px 14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                🤝 Предложить ничью
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
