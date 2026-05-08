'use client'

import { useEffect, useRef, useState } from 'react'
import $ from 'jquery'
import 'chessboard/dist/chessboard-1.0.0.min.css'
import { useChessTimer } from '@/hooks/useChessTimer'
import ChessTimerDisplay from '@/components/ChessTimerDisplay'

interface BotChessBoardProps {
  timeControl?: number
  onGameEnd?: (result: 'win' | 'lose' | 'draw') => void
}

export default function BotChessBoard({ timeControl = 600, onGameEnd }: BotChessBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [game, setGame] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [fen, setFen] = useState('')
  const boardInstance = useRef<any>(null)

  // Инициализация Chess при загрузке компонента
  useEffect(() => {
    const initChess = async () => {
      try {
        const Chess = (await import('chess.js')).default
        const newGame = new Chess()
        setGame(newGame)
        setFen(newGame.fen())
      } catch (error) {
        console.error('Ошибка при инициализации Chess:', error)
      }
    }
    initChess()
  }, [])

  // 🔹 Таймер игры
  const { 
    state: timer, 
    start: startTimer, 
    switchTurn: switchTimerTurn, 
    endGame: endTimerGame,
    formatTime 
  } = useChessTimer({ 
    initialTime: timeControl, 
    enabled: true,
    onTimeout: (loser) => {
      const result = loser === 'player' ? 'lose' : 'win'
      onGameEnd?.(result)
      endTimerGame(loser === 'player' ? 'opponent' : 'player')
      alert(loser === 'player' ? '⏰ Время вышло! Вы проиграли.' : '⏰ Бот превысил время!')
    }
  })

  const makeRandomBotMove = () => {
    if (!game || game.game_over()) return
    const moves = game.moves({ verbose: true }) as any[]
    if (moves.length === 0) return
    const move = moves[Math.floor(Math.random() * moves.length)] as any
    game.move(move.san)
    setFen(game.fen())
    updateStatus()
  }

  const onDragStart = (_source: string, piece: string) => {
    if (!game || game.game_over() || timer.isGameOver) return false
    return piece.search(/^b/) === -1 // только белые фигуры
  }

  const onDrop = (source: string, target: string) => {
    if (!game) return 'snapback'
    
    // 🔹 Запускаем таймер при первом ходе
    if (!timer.isRunning && !timer.isGameOver) startTimer()
    
    const move = game.move({ from: source, to: target, promotion: 'q' })
    if (move === null) return 'snapback'
    
    setFen(game.fen())
    updateStatus()
    
    // 🔹 Переключаем таймер после хода игрока
    switchTimerTurn()
    
    // 🔹 Ход бота
    setTimeout(() => {
      if (!game.game_over() && !timer.isGameOver) {
        makeRandomBotMove()
        // 🔹 Переключаем таймер после хода бота
        switchTimerTurn()
      }
    }, 250)
    
    return 'snapback'
  }

  const onSnapEnd = () => {
    if (boardInstance.current && game) boardInstance.current.position(game.fen())
  }

  const updateStatus = () => {
    if (!game) return
    
    let newStatus = ''
    const moveColor = game.turn() === 'w' ? 'Белые' : 'Чёрные'
    if (game.in_checkmate()) {
      newStatus = `♔ Мат! ${moveColor === 'Белые' ? 'Чёрные' : 'Белые'} победили`
      const result = moveColor === 'Белые' ? 'win' : 'lose'
      onGameEnd?.(result as 'win' | 'lose')
      endTimerGame(result === 'win' ? 'player' : 'opponent')
    } else if (game.in_draw()) {
      newStatus = '♔ Ничья'
      onGameEnd?.('draw')
      endTimerGame('draw')
    } else {
      newStatus = `Ход: ${moveColor}`
      if (game.in_check()) newStatus += ' ♔ ШАХ!'
    }
    setStatus(newStatus)
  }

  useEffect(() => {
    if (!boardRef.current || !game) return
    // @ts-ignore
    boardInstance.current = $(boardRef.current).chessboard({
      draggable: true,
      position: 'start',
      onDragStart,
      onDrop,
      onSnapEnd,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    })
    updateStatus()
    return () => {
      if (boardInstance.current) {
        // @ts-ignore
        $(boardRef.current).chessboard('destroy')
      }
    }
  }, [game])

  useEffect(() => {
    if (boardInstance.current) boardInstance.current.position(fen, false)
  }, [fen])

  return (
    <div className="bot-chess-board" style={{ maxWidth: 400, margin: '0 auto' }}>
      {/* 🔹 Таймеры */}
      <ChessTimerDisplay 
        playerTime={formatTime(timer.playerTime)}
        opponentTime={formatTime(timer.opponentTime)}
        activePlayer={timer.activePlayer}
        isGameOver={timer.isGameOver}
        winner={timer.winner}
        playerLabel="Вы"
        opponentLabel="🤖 Бот"
      />
      {/* 🔹 Доска */}
      <div ref={boardRef} style={{ marginBottom: 12 }} />
      <div style={{ textAlign: 'center', fontWeight: 500 }}>{status}</div>
      {timer.isGameOver && (
        <button 
          onClick={() => { 
            if (game) {
              game.reset()
              setFen(game.fen())
              setStatus('')
            }
          }}
          style={{ marginTop: 12, padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          🔄 Новая партия
        </button>
      )}
    </div>
  )
}
