# Роль
Ты — Senior Full-Stack Blockchain Developer. Твоя задача — дополнить и полностью реализовать структуру приложения "c4c-chess" (шахматы на блокчейне с ставками), используя уже установленный фреймворк/контекст OpenClaw.

# Контекст проекта
Приложение представляет собой онлайн-шахматы, где игроки делают ставки в токене **C4C** (BSC Network).
- **Токен игры (C4C):** `0xaac20575371de01b4d10c4e7566d5453d72d56e7`
- **Смарт-контракт игры:** `0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005`
- **Механика ставок:** От 50,000 до 1,000,000 C4C, шаг 50,000.
- **Покупка токена:** Ссылка для пользователя: `https://www.pink.meme/token/bsc/0xaac20575371de01b4d10c4e7566d5453d72d56e7`
- **ОС:** Windows (учитывай пути и разделители при необходимости, но используй кроссплатформенные решения в коде).

# Текущая структура (должна быть сохранена и дополнена)
Проверь наличие следующей структуры. Если файлы отсутствуют — создай их с ПОЛНЫМ рабочим кодом.

## 1. Backend (`apps/api`)
Необходимо реализовать сервер на Node.js/TypeScript (предположительно NestJS или Express + Socket.io, выбери оптимальный вариант для real-time игры).

**Файлы для создания/проверки:**
1. `apps/api/package.json` — зависимости (socket.io, web3/ethers, cors, dotenv и т.д.).
2. `apps/api/tsconfig.json` — конфигурация TS.
3. `apps/api/.env.example` — переменные: `PORT`, `RPC_URL_BSC`, `CONTRACT_ADDRESS`, `TOKEN_ADDRESS`.
4. `apps/api/src/main.ts` — точка входа, запуск HTTP сервера и WebSocket гейта.
5. `apps/api/src/config/stake.config.ts` — константы:
   - `MIN_STAKE = 50000`
   - `MAX_STAKE = 1000000`
   - `STAKE_STEP = 50000`
   - `TOKEN_CONTRACT_ADDRESS = '0xaac20575371de01b4d10c4e7566d5453d72d56e7'`
   - `GAME_CONTRACT_ADDRESS = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005'`
6. `apps/api/src/types/matchmaking.ts` — интерфейсы: `Match`, `Player`, `GameState`, `StakeAmount`.
7. `apps/api/src/services/contract.service.ts` — сервис для взаимодействия с BSC:
   - Проверка баланса токенов C4C у игрока.
   - Валидация транзакции ставки (через ABI контракта).
   - *Важно:* Используй ethers.js или web3.js. Подключись к BSC RPC.
8. `apps/api/src/services/match.service.ts` — логика поиска пары:
   - Очередь игроков с одинаковыми ставками.
   - Создание матча при наличии 2 игроков.
9. `apps/api/src/game/lobby.gateway.ts` — WebSocket обработчики:
   - `joinLobby`: игрок входит с указанием ставки.
   - `matchFound`: отправка данных о противнике.
   - `move`: передача хода (валидация на бэкенде желательна, или хотя бы ретрансляция).
   - `gameOver`: фиксация результата для выплаты выигрыша.

## 2. Frontend (`apps/web`)
Next.js приложение.

**Файлы для создания/проверки:**
1. `apps/web/package.json`, `next.config.js`, `tsconfig.json`, `.env.example`.
2. `apps/web/src/app/layout.tsx` — подключение провайдеров (Wagmi/RainbowKit для кошелька).
3. `apps/web/src/app/page.tsx` — главная страница (Лобби).
4. `apps/web/src/components/stake-actions.tsx` — компонент выбора ставки (слайдер или кнопки с шагом 50k).
5. `apps/web/src/components/stake-explainer.tsx` — инфо-блок со ссылкой на покупку токенов.
6. `apps/web/src/components/live-game.tsx` — шахматная доска (используй `chess.js` и `react-chessboard` или аналог).
7. `apps/web/src/lib/contract-utils.ts` — функции для вызова смарт-контракта (approve, stake).
8. `apps/web/src/lib/socket.ts` — клиентское подключение к WS.
9. `apps/web/src/styles/globals.css` — стили.

## 3. Packages (`packages/contracts`)
1. `packages/contracts/c4cGameAbi.ts` — экспортируй минимальный ABI для контракта `0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005` (методы: `stake`, `claimWin`, `getBalance`). *Если точного ABI нет, создай заглушку с комментариями, где его взять.*

# Требования к реализации
1. **Безопасность:** На бэкенде проверяй, что ставка игрока соответствует разрешенным значениям (50k, 100k... 1M).
2. **Интеграция:** Фронтенд должен читать конфиги из бэкенда или иметь дублирующие константы для валидации перед отправкой транзакции.
3. **Код:** Пиши полный код файлов. Не используй комментарии вроде `// ... остальной код`. Мне нужны готовые к деплою файлы.
4. **Деплой:** Подготовь проект так, чтобы его можно было запушить на GitHub. Убедись, что `.gitignore` исключает `node_modules`, `.env`, `dist`.

# Действия
1. Просканируй текущую папку `c4c-chess`.
2. Создай отсутствующие папки.
3. Сгенерируй содержимое каждого файла из списка выше.
4. В файлах `contract.service.ts` и `contract-utils.ts` используй указанные адреса контрактов.
5. В `stake.config.ts` жестко пропили лимиты ставок.

Приступай к генерации.