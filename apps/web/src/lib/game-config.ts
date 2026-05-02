// apps/web/src/lib/game-config.ts

export const MIN_STAKE = 50000;
export const MAX_STAKE = 1000000;

export const timeControls = [15, 30, 60, 120] as const;

// Добавлен недостающий экспорт
export const wagerOptions = [50000, 100000, 250000, 500000] as const;