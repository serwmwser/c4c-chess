'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface ChessTimerState {
  playerTime: number
  opponentTime: number
  activePlayer: 'player' | 'opponent'
  isRunning: boolean
  isGameOver: boolean
  winner: 'player' | 'opponent' | 'draw' | null
}

export interface UseChessTimerProps {
  initialTime: number
  onTimeout?: (loser: 'player' | 'opponent') => void
  enabled?: boolean
}

export function useChessTimer({ 
  initialTime, 
  onTimeout, 
  enabled = true 
}: UseChessTimerProps) {
  const [state, setState] = useState<ChessTimerState>({
    playerTime: initialTime,
    opponentTime: initialTime,
    activePlayer: 'player',
    isRunning: false,
    isGameOver: false,
    winner: null
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    if (!enabled) return
    setState(prev => ({ ...prev, isRunning: true }))
  }, [enabled])

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }))
  }, [])

  const switchTurn = useCallback(() => {
    setState(prev => {
      if (prev.isGameOver) return prev
      const newActive = prev.activePlayer === 'player' ? 'opponent' : 'player'
      return { ...prev, activePlayer: newActive }
    })
  }, [])

  const endGame = useCallback((winner: 'player' | 'opponent' | 'draw') => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isGameOver: true,
      winner
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      playerTime: initialTime,
      opponentTime: initialTime,
      activePlayer: 'player',
      isRunning: false,
      isGameOver: false,
      winner: null
    })
  }, [initialTime])

  useEffect(() => {
    if (!enabled || !state.isRunning || state.isGameOver) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.isGameOver) return prev
        const activeKey = prev.activePlayer === 'player' ? 'playerTime' : 'opponentTime'
        const newTime = prev[activeKey] - 1
        if (newTime <= 0) {
          const loser = prev.activePlayer
          const winner = loser === 'player' ? 'opponent' : 'player'
          onTimeout?.(loser)
          return { ...prev, [activeKey]: 0, isRunning: false, isGameOver: true, winner }
        }
        return { ...prev, [activeKey]: newTime }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, state.isRunning, state.isGameOver, state.activePlayer, onTimeout])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins + ':' + secs.toString().padStart(2, '0')
  }

  return {
    state, start, stop, switchTurn, endGame, reset, formatTime,
    getPlayerTime: () => state.playerTime,
    getOpponentTime: () => state.opponentTime,
    isActivePlayer: () => state.activePlayer === 'player',
    isPlayerTurn: () => state.activePlayer === 'player' && !state.isGameOver,
    isOpponentTurn: () => state.activePlayer === 'opponent' && !state.isGameOver
  }
}
