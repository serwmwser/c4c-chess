// 🔹 Шахматные часы: переключаются после хода, отсчитывают назад, фиксируют просрочку
export function initClock(time: number) { return { w: time, b: time, turn: 'w' as 'w'|'b', active: true, finished: false }; }
export function tickClock(state: any, dt: number) {
  if (!state.active || state.finished) return state;
  const key = state.turn;
  const next = { ...state };
  next[key] = Math.max(0, next[key] - dt);
  if (next[key] === 0) next.finished = true;
  return next;
}
export function switchTurn(state: any) {
  if (state.finished) return state;
  return { ...state, turn: state.turn === 'w' ? 'b' : 'w' };
}
export const PATCH_019 = { initClock, tickClock, switchTurn };
