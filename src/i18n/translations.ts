// Système d'internationalisation pour AIONE
// 9 langues supportées avec détection automatique

export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'ko';

export interface Translations {
  // Pop-up d'identification
  loginTitle: string;
  loginDescription: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  savePassword: string;
  stayConnected: string;
  loginButton: string;
  createAccount: string;
  needHelp: string;
  sendMessage: string;
  helpPlaceholder: string;
  messageSent: string;
  
  // Messages d'erreur
  errorAccountLocked: string;
  errorWrongPassword: string;
  errorUsernameTooShort: string;
  errorPasswordRequired: string;
  
  // Messages de succès
  successLogin: string;
  successAccountCreated: string;
  
  // Session
  sessionExpired: string;
  sessionReauthRequired: string;
  
  // Confidentialité
  noCookiesMessage: string;
  
  // Compte
  deleteAllData: string;
  deleteConfirmation: string;
  dataDeleted: string;
  logout: string;
  
  // Général
  close: string;
  cancel: string;
  confirm: string;
  activeUsers: string;
}

const translations: Record<SupportedLanguage, Translations> = {
  fr: {
    loginTitle: "IDENTIFICATION",
    loginDescription: "Connectez-vous à votre espace AIONE",
    identifierLabel: "IDENTIFIANT",
    identifierPlaceholder: "Votre identifiant",
    passwordLabel: "MOT DE PASSE",
    passwordPlaceholder: "Votre mot de passe (optionnel)",
    savePassword: "ENREGISTRER MOT DE PASSE",
    stayConnected: "Rester connecté",
    loginButton: "CONNEXION",
    createAccount: "Créer un compte",
    needHelp: "Besoin d'aide ?",
    sendMessage: "Envoyer",
    helpPlaceholder: "Décrivez votre problème...",
    messageSent: "Message envoyé !",
    errorAccountLocked: "Compte bloqué pendant 1h",
    errorWrongPassword: "Mot de passe incorrect",
    errorUsernameTooShort: "L'identifiant doit contenir au moins 3 caractères",
    errorPasswordRequired: "Mot de passe requis pour ce compte",
    successLogin: "Connexion réussie",
    successAccountCreated: "Compte créé avec succès",
    sessionExpired: "Session expirée",
    sessionReauthRequired: "Session en veille - Réidentification requise",
    noCookiesMessage: "Les cookies ou données personnelles ne sont pas stockées et ne le seront jamais",
    deleteAllData: "Supprimer tout mon historique",
    deleteConfirmation: "Êtes-vous sûr de vouloir supprimer toutes vos données ?",
    dataDeleted: "Toutes vos données ont été supprimées",
    logout: "Déconnexion",
    close: "Fermer",
    cancel: "Annuler",
    confirm: "Confirmer",
    activeUsers: "utilisateurs actifs",
  },
  en: {
    loginTitle: "LOGIN",
    loginDescription: "Connect to your AIONE space",
    identifierLabel: "USERNAME",
    identifierPlaceholder: "Your username",
    passwordLabel: "PASSWORD",
    passwordPlaceholder: "Your password (optional)",
    savePassword: "SAVE PASSWORD",
    stayConnected: "Stay connected",
    loginButton: "LOGIN",
    createAccount: "Create account",
    needHelp: "Need help?",
    sendMessage: "Send",
    helpPlaceholder: "Describe your issue...",
    messageSent: "Message sent!",
    errorAccountLocked: "Account locked for 1 hour",
    errorWrongPassword: "Incorrect password",
    errorUsernameTooShort: "Username must be at least 3 characters",
    errorPasswordRequired: "Password required for this account",
    successLogin: "Login successful",
    successAccountCreated: "Account created successfully",
    sessionExpired: "Session expired",
    sessionReauthRequired: "Session idle - Re-authentication required",
    noCookiesMessage: "Cookies or personal data are not stored and never will be",
    deleteAllData: "Delete all my data",
    deleteConfirmation: "Are you sure you want to delete all your data?",
    dataDeleted: "All your data has been deleted",
    logout: "Logout",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    activeUsers: "active users",
  },
  es: {
    loginTitle: "IDENTIFICACIÓN",
    loginDescription: "Conéctese a su espacio AIONE",
    identifierLabel: "IDENTIFICADOR",
    identifierPlaceholder: "Su identificador",
    passwordLabel: "CONTRASEÑA",
    passwordPlaceholder: "Su contraseña (opcional)",
    savePassword: "GUARDAR CONTRASEÑA",
    stayConnected: "Mantener sesión",
    loginButton: "CONECTAR",
    createAccount: "Crear cuenta",
    needHelp: "¿Necesita ayuda?",
    sendMessage: "Enviar",
    helpPlaceholder: "Describa su problema...",
    messageSent: "¡Mensaje enviado!",
    errorAccountLocked: "Cuenta bloqueada durante 1 hora",
    errorWrongPassword: "Contraseña incorrecta",
    errorUsernameTooShort: "El identificador debe tener al menos 3 caracteres",
    errorPasswordRequired: "Contraseña requerida para esta cuenta",
    successLogin: "Conexión exitosa",
    successAccountCreated: "Cuenta creada exitosamente",
    sessionExpired: "Sesión expirada",
    sessionReauthRequired: "Sesión inactiva - Reidentificación requerida",
    noCookiesMessage: "Las cookies o datos personales no se almacenan ni se almacenarán nunca",
    deleteAllData: "Eliminar todo mi historial",
    deleteConfirmation: "¿Está seguro de que desea eliminar todos sus datos?",
    dataDeleted: "Todos sus datos han sido eliminados",
    logout: "Cerrar sesión",
    close: "Cerrar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    activeUsers: "usuarios activos",
  },
  de: {
    loginTitle: "ANMELDUNG",
    loginDescription: "Verbinden Sie sich mit Ihrem AIONE-Bereich",
    identifierLabel: "BENUTZERNAME",
    identifierPlaceholder: "Ihr Benutzername",
    passwordLabel: "PASSWORT",
    passwordPlaceholder: "Ihr Passwort (optional)",
    savePassword: "PASSWORT SPEICHERN",
    stayConnected: "Angemeldet bleiben",
    loginButton: "ANMELDEN",
    createAccount: "Konto erstellen",
    needHelp: "Brauchen Sie Hilfe?",
    sendMessage: "Senden",
    helpPlaceholder: "Beschreiben Sie Ihr Problem...",
    messageSent: "Nachricht gesendet!",
    errorAccountLocked: "Konto für 1 Stunde gesperrt",
    errorWrongPassword: "Falsches Passwort",
    errorUsernameTooShort: "Benutzername muss mindestens 3 Zeichen haben",
    errorPasswordRequired: "Passwort für dieses Konto erforderlich",
    successLogin: "Anmeldung erfolgreich",
    successAccountCreated: "Konto erfolgreich erstellt",
    sessionExpired: "Sitzung abgelaufen",
    sessionReauthRequired: "Sitzung inaktiv - Erneute Anmeldung erforderlich",
    noCookiesMessage: "Cookies oder persönliche Daten werden nicht gespeichert und werden es nie",
    deleteAllData: "Alle meine Daten löschen",
    deleteConfirmation: "Sind Sie sicher, dass Sie alle Ihre Daten löschen möchten?",
    dataDeleted: "Alle Ihre Daten wurden gelöscht",
    logout: "Abmelden",
    close: "Schließen",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    activeUsers: "aktive Benutzer",
  },
  it: {
    loginTitle: "IDENTIFICAZIONE",
    loginDescription: "Connettiti al tuo spazio AIONE",
    identifierLabel: "IDENTIFICATORE",
    identifierPlaceholder: "Il tuo identificatore",
    passwordLabel: "PASSWORD",
    passwordPlaceholder: "La tua password (opzionale)",
    savePassword: "SALVA PASSWORD",
    stayConnected: "Resta connesso",
    loginButton: "ACCEDI",
    createAccount: "Crea account",
    needHelp: "Hai bisogno di aiuto?",
    sendMessage: "Invia",
    helpPlaceholder: "Descrivi il tuo problema...",
    messageSent: "Messaggio inviato!",
    errorAccountLocked: "Account bloccato per 1 ora",
    errorWrongPassword: "Password errata",
    errorUsernameTooShort: "L'identificatore deve avere almeno 3 caratteri",
    errorPasswordRequired: "Password richiesta per questo account",
    successLogin: "Accesso riuscito",
    successAccountCreated: "Account creato con successo",
    sessionExpired: "Sessione scaduta",
    sessionReauthRequired: "Sessione inattiva - Riautenticazione richiesta",
    noCookiesMessage: "I cookie o i dati personali non vengono memorizzati e non lo saranno mai",
    deleteAllData: "Elimina tutti i miei dati",
    deleteConfirmation: "Sei sicuro di voler eliminare tutti i tuoi dati?",
    dataDeleted: "Tutti i tuoi dati sono stati eliminati",
    logout: "Esci",
    close: "Chiudi",
    cancel: "Annulla",
    confirm: "Conferma",
    activeUsers: "utenti attivi",
  },
  pt: {
    loginTitle: "IDENTIFICAÇÃO",
    loginDescription: "Conecte-se ao seu espaço AIONE",
    identifierLabel: "IDENTIFICADOR",
    identifierPlaceholder: "Seu identificador",
    passwordLabel: "SENHA",
    passwordPlaceholder: "Sua senha (opcional)",
    savePassword: "SALVAR SENHA",
    stayConnected: "Manter conectado",
    loginButton: "ENTRAR",
    createAccount: "Criar conta",
    needHelp: "Precisa de ajuda?",
    sendMessage: "Enviar",
    helpPlaceholder: "Descreva seu problema...",
    messageSent: "Mensagem enviada!",
    errorAccountLocked: "Conta bloqueada por 1 hora",
    errorWrongPassword: "Senha incorreta",
    errorUsernameTooShort: "O identificador deve ter pelo menos 3 caracteres",
    errorPasswordRequired: "Senha necessária para esta conta",
    successLogin: "Login bem-sucedido",
    successAccountCreated: "Conta criada com sucesso",
    sessionExpired: "Sessão expirada",
    sessionReauthRequired: "Sessão inativa - Reautenticação necessária",
    noCookiesMessage: "Cookies ou dados pessoais não são armazenados e nunca serão",
    deleteAllData: "Excluir todo o meu histórico",
    deleteConfirmation: "Tem certeza de que deseja excluir todos os seus dados?",
    dataDeleted: "Todos os seus dados foram excluídos",
    logout: "Sair",
    close: "Fechar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    activeUsers: "usuários ativos",
  },
  ja: {
    loginTitle: "ログイン",
    loginDescription: "AIONEスペースに接続",
    identifierLabel: "ユーザー名",
    identifierPlaceholder: "ユーザー名を入力",
    passwordLabel: "パスワード",
    passwordPlaceholder: "パスワード（任意）",
    savePassword: "パスワードを保存",
    stayConnected: "ログイン状態を維持",
    loginButton: "ログイン",
    createAccount: "アカウント作成",
    needHelp: "ヘルプが必要ですか？",
    sendMessage: "送信",
    helpPlaceholder: "問題を説明してください...",
    messageSent: "メッセージが送信されました！",
    errorAccountLocked: "アカウントが1時間ロックされています",
    errorWrongPassword: "パスワードが間違っています",
    errorUsernameTooShort: "ユーザー名は3文字以上必要です",
    errorPasswordRequired: "このアカウントにはパスワードが必要です",
    successLogin: "ログイン成功",
    successAccountCreated: "アカウントが作成されました",
    sessionExpired: "セッションが期限切れです",
    sessionReauthRequired: "セッション待機中 - 再認証が必要です",
    noCookiesMessage: "クッキーや個人データは保存されず、今後も保存されません",
    deleteAllData: "すべてのデータを削除",
    deleteConfirmation: "すべてのデータを削除してもよろしいですか？",
    dataDeleted: "すべてのデータが削除されました",
    logout: "ログアウト",
    close: "閉じる",
    cancel: "キャンセル",
    confirm: "確認",
    activeUsers: "アクティブユーザー",
  },
  zh: {
    loginTitle: "登录",
    loginDescription: "连接到您的AIONE空间",
    identifierLabel: "用户名",
    identifierPlaceholder: "您的用户名",
    passwordLabel: "密码",
    passwordPlaceholder: "您的密码（可选）",
    savePassword: "保存密码",
    stayConnected: "保持登录",
    loginButton: "登录",
    createAccount: "创建账户",
    needHelp: "需要帮助？",
    sendMessage: "发送",
    helpPlaceholder: "描述您的问题...",
    messageSent: "消息已发送！",
    errorAccountLocked: "账户已锁定1小时",
    errorWrongPassword: "密码错误",
    errorUsernameTooShort: "用户名必须至少3个字符",
    errorPasswordRequired: "此账户需要密码",
    successLogin: "登录成功",
    successAccountCreated: "账户创建成功",
    sessionExpired: "会话已过期",
    sessionReauthRequired: "会话空闲 - 需要重新认证",
    noCookiesMessage: "不存储Cookie或个人数据，永远不会存储",
    deleteAllData: "删除我的所有数据",
    deleteConfirmation: "您确定要删除所有数据吗？",
    dataDeleted: "您的所有数据已被删除",
    logout: "登出",
    close: "关闭",
    cancel: "取消",
    confirm: "确认",
    activeUsers: "活跃用户",
  },
  ko: {
    loginTitle: "로그인",
    loginDescription: "AIONE 공간에 연결",
    identifierLabel: "사용자 이름",
    identifierPlaceholder: "사용자 이름",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "비밀번호 (선택사항)",
    savePassword: "비밀번호 저장",
    stayConnected: "로그인 유지",
    loginButton: "로그인",
    createAccount: "계정 만들기",
    needHelp: "도움이 필요하신가요?",
    sendMessage: "보내기",
    helpPlaceholder: "문제를 설명하세요...",
    messageSent: "메시지가 전송되었습니다!",
    errorAccountLocked: "계정이 1시간 동안 잠겼습니다",
    errorWrongPassword: "비밀번호가 틀렸습니다",
    errorUsernameTooShort: "사용자 이름은 최소 3자 이상이어야 합니다",
    errorPasswordRequired: "이 계정에는 비밀번호가 필요합니다",
    successLogin: "로그인 성공",
    successAccountCreated: "계정이 생성되었습니다",
    sessionExpired: "세션이 만료되었습니다",
    sessionReauthRequired: "세션 유휴 - 재인증 필요",
    noCookiesMessage: "쿠키나 개인 데이터는 저장되지 않으며 앞으로도 저장되지 않습니다",
    deleteAllData: "모든 데이터 삭제",
    deleteConfirmation: "모든 데이터를 삭제하시겠습니까?",
    dataDeleted: "모든 데이터가 삭제되었습니다",
    logout: "로그아웃",
    close: "닫기",
    cancel: "취소",
    confirm: "확인",
    activeUsers: "활성 사용자",
  },
};

// Detect browser language and return supported language
export function detectLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  
  if (browserLang in translations) {
    return browserLang as SupportedLanguage;
  }
  
  // Fallback to English
  return 'en';
}

// Get translations for a specific language
export function getTranslations(lang?: SupportedLanguage): Translations {
  const language = lang || detectLanguage();
  return translations[language] || translations.en;
}

// Get a single translation key
export function t(key: keyof Translations, lang?: SupportedLanguage): string {
  const trans = getTranslations(lang);
  return trans[key] || translations.en[key] || key;
}

export default translations;
