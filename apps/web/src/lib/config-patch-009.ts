export const LANGUAGES = {
  ru: { name: 'Русский', flag: '🇷🇺' }, en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' }, fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' }, pt: { name: 'Português', flag: '🇵🇹' },
  zh: { name: '中文', flag: '🇨🇳' }, ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' }, ar: { name: 'العربية', flag: '🇸🇦' }
} as const;

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  ru: { connect:'🔗 Войти', profile:'👤 Профиль', lobby:'🎲 Лобби', friends:'👥 Друзья', board:'♟️ Доска', newGame:'🔄 Новая игра', time:'Время', stake:'Ставка', desc:'Описание', links:'Ссылки', theme:'🎨 Тема', logout:'Выйти', loading:'⏳ Загрузка...', chooseWallet:'Выберите кошелёк', close:'Закрыть', balance:'Баланс', play:'▶️ Играть', invite:'📩 Вызвать', addFriend:'➕ Добавить', noGames:'Нет игр', noFriends:'Нет друзей' },
  en: { connect:'🔗 Connect', profile:'👤 Profile', lobby:'🎲 Lobby', friends:'👥 Friends', board:'♟️ Board', newGame:'🔄 New Game', time:'Time', stake:'Stake', desc:'Description', links:'Links', theme:'🎨 Theme', logout:'Logout', loading:'⏳ Loading...', chooseWallet:'Choose wallet', close:'Close', balance:'Balance', play:'▶️ Play', invite:'📩 Invite', addFriend:'➕ Add', noGames:'No games', noFriends:'No friends' },
  es: { connect:'🔗 Conectar', profile:'👤 Perfil', lobby:'🎲 Lobby', friends:'👥 Amigos', board:'♟️ Tablero', newGame:'🔄 Nueva Partida', time:'Tiempo', stake:'Apuesta', desc:'Descripción', links:'Enlaces', theme:'🎨 Tema', logout:'Salir', loading:'⏳ Cargando...', chooseWallet:'Elegir billetera', close:'Cerrar', balance:'Saldo', play:'▶️ Jugar', invite:'📩 Invitar', addFriend:'➕ Añadir', noGames:'Sin partidas', noFriends:'Sin amigos' },
  fr: { connect:'🔗 Connecter', profile:'👤 Profil', lobby:'🎲 Lobby', friends:'👥 Amis', board:'♟️ Échiquier', newGame:'🔄 Nouvelle Partie', time:'Temps', stake:'Mise', desc:'Description', links:'Liens', theme:'🎨 Thème', logout:'Déconnexion', loading:'⏳ Chargement...', chooseWallet:'Choisir portefeuille', close:'Fermer', balance:'Solde', play:'▶️ Jouer', invite:'📩 Inviter', addFriend:'➕ Ajouter', noGames:'Pas de parties', noFriends:'Pas d\'amis' },
  de: { connect:'🔗 Verbinden', profile:'👤 Profil', lobby:'🎲 Lobby', friends:'👥 Freunde', board:'♟️ Brett', newGame:'🔄 Neues Spiel', time:'Zeit', stake:'Einsatz', desc:'Beschreibung', links:'Links', theme:'🎨 Thema', logout:'Abmelden', loading:'⏳ Laden...', chooseWallet:'Wallet wählen', close:'Schließen', balance:'Guthaben', play:'▶️ Spielen', invite:'📩 Einladen', addFriend:'➕ Hinzufügen', noGames:'Keine Spiele', noFriends:'Keine Freunde' },
  pt: { connect:'🔗 Conectar', profile:'👤 Perfil', lobby:'🎲 Lobby', friends:'👥 Amigos', board:'♟️ Tabuleiro', newGame:'🔄 Novo Jogo', time:'Tempo', stake:'Aposta', desc:'Descrição', links:'Links', theme:'🎨 Tema', logout:'Sair', loading:'⏳ Carregando...', chooseWallet:'Escolher carteira', close:'Fechar', balance:'Saldo', play:'▶️ Jogar', invite:'📩 Convidar', addFriend:'➕ Adicionar', noGames:'Sem jogos', noFriends:'Sem amigos' },
  zh: { connect:'🔗 连接', profile:'👤 资料', lobby:'🎲 大厅', friends:'👥 好友', board:'♟️ 棋盘', newGame:'🔄 新游戏', time:'时间', stake:'赌注', desc:'描述', links:'链接', theme:'🎨 主题', logout:'退出', loading:'⏳ 加载中...', chooseWallet:'选择钱包', close:'关闭', balance:'余额', play:'▶️ 开始', invite:'📩 邀请', addFriend:'➕ 添加', noGames:'暂无游戏', noFriends:'暂无好友' },
  ja: { connect:'🔗 接続', profile:'👤 プロフィール', lobby:'🎲 ロビー', friends:'👥 フレンド', board:'♟️ 盤面', newGame:'🔄 新規対局', time:'時間', stake:'ベット', desc:'説明', links:'リンク', theme:'🎨 テーマ', logout:'ログアウト', loading:'⏳ 読込中...', chooseWallet:'ウォレット選択', close:'閉じる', balance:'残高', play:'▶️ 対局', invite:'📩 招待', addFriend:'➺ 追加', noGames:'ゲームなし', noFriends:'フレンドなし' },
  ko: { connect:'🔗 연결', profile:'👤 프로필', lobby:'🎲 로비', friends:'👥 친구', board:'♟️ 보드', newGame:'🔄 새 게임', time:'시간', stake:'배팅', desc:'설명', links:'링크', theme:'🎨 테마', logout:'로그아웃', loading:'⏳ 로딩 중...', chooseWallet:'지갑 선택', close:'닫기', balance:'잔액', play:'▶️ 시작', invite:'📩 초대', addFriend:'➕ 추가', noGames:'게임 없음', noFriends:'친구 없음' },
  ar: { connect:'🔗 ربط', profile:'👤 الملف', lobby:'🎲 الردهة', friends:'👥 الأصدقاء', board:'♟️ الرقعة', newGame:'🔄 لعبة جديدة', time:'الوقت', stake:'الرهان', desc:'الوصف', links:'الروابط', theme:'🎨 المظهر', logout:'خروج', loading:'⏳ جاري التحميل...', chooseWallet:'اختر المحفظة', close:'إغلاق', balance:'الرصيد', play:'▶️ لعب', invite:'📩 دعوة', addFriend:'➕ إضافة', noGames:'لا توجد ألعاب', noFriends:'لا أصدقاء' }
} as const;

export function t(lang: string, key: string): string {
  return (TRANSLATIONS as any)[lang]?.[key] || TRANSLATIONS.en[key] || key;
}

export const PATCH_009 = { LANGUAGES, TRANSLATIONS, t };
