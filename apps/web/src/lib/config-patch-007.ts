// 🔹 ПАТЧ 7: Безопасные цвета доски (добавлены алиасы 'classic' и фоллбэки)
// Решает ошибку "Cannot read properties of undefined", если в профиле осталась старая тема
export const SAFE_BOARD_THEMES: any = {
  blue: { light: '#eeeed2', dark: '#769656' },
  green: { light: '#ffffdd', dark: '#86a665' },
  brown: { light: '#f0d9b5', dark: '#b58863' },
  grey: { light: '#c9c9c9', dark: '#7a7a7a' },
  classic: { light: '#eeeed2', dark: '#769656' }, // 🔥 Алиас для старой темы
  default: { light: '#eeeed2', dark: '#769656' }  // 🔥 Алиас по умолчанию
};

export const PATCH_007 = { SAFE_BOARD_THEMES };
