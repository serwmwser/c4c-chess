// 🔹 ПАТЧ 11: Безопасные алиасы для UI (предотвращает ошибки минификации)
// Импорт из правильных источников
import { CLASSIC_THEMES } from './config-patch-008';
import { LANGUAGES, t } from './config-patch-009';
import { SAFE_BOARD_THEMES } from './config-patch-007';

export const UI_THEMES = CLASSIC_THEMES;
export const UI_LANGS = LANGUAGES;
export const UI_BOARDS = SAFE_BOARD_THEMES;
export const UI_TRANSLATE = t;

export const PATCH_011 = { UI_THEMES, UI_LANGS, UI_BOARDS, UI_TRANSLATE };
