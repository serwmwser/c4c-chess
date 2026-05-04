import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(__dirname, '..', 'src', 'lib');
const targetFile = path.join(libDir, 'master-config.ts');

// 🔍 Ищем все патчи
const patches = fs.readdirSync(libDir)
  .filter(f => /^config-patch-\d+\.ts$/.test(f))
  .sort((a, b) => {
    const nA = parseInt(a.match(/\d+/)[0]);
    const nB = parseInt(b.match(/\d+/)[0]);
    return nA - nB;
  });

let imports = `import { CONFIG_BASE } from './config-base';\n`;
let spreadList = '';
let exportsList = '';

patches.forEach(file => {
  const varName = path.basename(file, '.ts').toUpperCase().replace(/-/g, '_');
  imports += `import { ${varName} } from './${path.basename(file, '.ts')}';\n`;
  spreadList += `  ...${varName},\n`;
  exportsList += `export const ${varName} = CONFIG.${varName};\n`;
});

const content = `// 🔥 AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run 'npm run generate:config' to update.

${imports}
export const CONFIG = {
  ...CONFIG_BASE,
${spreadList}};

// 🔹 AUTO-EXPORTS: Все ключи из всех патчей доступны в приложении
${exportsList}
// 🔹 Дополнительные алиасы для удобства
export const validateStake = CONFIG.validateStake || (() => ({ valid: true }));
export const formatPrizePool = CONFIG.formatPrizePool || ((s) => \`\${(s*2).toLocaleString()} C4C\`);
export const ALLOWED_STAKES = CONFIG.ALLOWED_STAKES || [5000];
export const useApproveC4C = CONFIG.useApproveC4C || (() => ({}));
export const useCreateTokenGame = CONFIG.useCreateTokenGame || (() => ({}));
export const useJoinTokenGame = CONFIG.useJoinTokenGame || (() => ({}));
export const generateGameInvite = CONFIG.generateGameInvite || (() => ({}));
export const sendInviteToChat = CONFIG.sendInviteToChat || (() => {});
export const publishGameToLobby = CONFIG.publishGameToLobby || (() => {});
export const canJoinGame = CONFIG.canJoinGame || (async () => ({ canJoin: false }));
`;

fs.writeFileSync(targetFile, content);
console.log(`✅ master-config.ts обновлён: ${patches.length} патчей подключено автоматически.`);
