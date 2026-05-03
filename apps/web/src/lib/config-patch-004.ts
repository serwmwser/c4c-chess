// 🔹 ПАТЧ 4: Яркие профили + Доска Chess.com
export const CHESS_COM_BOARD_THEMES = {
  blue: { name: 'Chess.com Blue', light: '#eeeed2', dark: '#769656' },
  green: { name: 'Chess.com Green', light: '#ffffdd', dark: '#86a665' },
  brown: { name: 'Chess.com Brown', light: '#f0d9b5', dark: '#b58863' },
  grey: { name: 'Chess.com Grey', light: '#c9c9c9', dark: '#7a7a7a' },
  purple: { name: 'Chess.com Purple', light: '#e8e8e8', dark: '#9c7c6c' },
  ocean: { name: 'Ocean Blue', light: '#b3d4e0', dark: '#4b8fa3' },
  sunrise: { name: 'Sunrise Gold', light: '#fef9e7', dark: '#d4a373' },
  neon: { name: 'Neon Arcade', light: '#2b2b2b', dark: '#e63946' }
} as const;

export const BRIGHT_PROFILE_THEMES = {
  sunny: { name: '☀️ Солнечный', bg: '#ffecd2', text: '#2d3436', accent: '#fdcb6e', card: '#fff9c4' },
  coral: { name: '🐠 Коралловый', bg: '#ff9a9e', text: '#fff', accent: '#ff6b6b', card: '#ffb3ba' },
  mint: { name: '🌿 Мятный', bg: '#a8e6cf', text: '#2d3436', accent: '#00b894', card: '#dcedc1' },
  sky: { name: '🌊 Небесный', bg: '#89f7fe', text: '#2d3436', accent: '#3498db', card: '#bae8e8' },
  lavender: { name: '💜 Лавандовый', bg: '#e0c3fc', text: '#2d3436', accent: '#8e44ad', card: '#f3e5f5' },
  peach: { name: '🍑 Персиковый', bg: '#ffd1ff', text: '#2d3436', accent: '#e91e63', card: '#f8bbd0' },
  lime: { name: '🍏 Лаймовый', bg: '#d4fc79', text: '#2d3436', accent: '#2ecc71', card: '#c8e6c9' },
  violet: { name: '🌸 Фиалковый', bg: '#fa709a', text: '#fff', accent: '#9b59b6', card: '#e1bee7' }
} as const;

export const PATCH_004 = { CHESS_COM_BOARD_THEMES, BRIGHT_PROFILE_THEMES };
