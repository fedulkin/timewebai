export type FieldDef = {
  key: string
  label: string
  placeholder?: string
  type: "text" | "password" | "textarea"
  required?: boolean
}

export type Skill = {
  id: string
  name: string
  connector: string
  description: string
  longDescription: string
  author: string
  tools: string[]
  category: "search" | "communication" | "data" | "productivity" | "dev"
  icon: string
  color: string
  fields: FieldDef[]
}

export const SKILLS: Skill[] = [
  // Search
  {
    id: "web-search",
    name: "Веб-поиск",
    connector: "Brave Search",
    description: "Ищет актуальную информацию в интернете по запросу пользователя",
    longDescription: "Подключите Brave Search, чтобы агент мог искать актуальную информацию в интернете. Агент будет использовать поиск автоматически, когда вопрос требует свежих данных или фактов, которые могут измениться.",
    author: "Brave Software",
    tools: ["web_search", "get_page_content"],
    category: "search",
    icon: "Search",
    color: "#f97316",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "BSA...", type: "password", required: true },
    ],
  },
  {
    id: "news-search",
    name: "Поиск новостей",
    connector: "NewsAPI",
    description: "Находит свежие новости и публикации по заданной теме",
    longDescription: "NewsAPI даёт доступ к миллионам новостных статей из тысяч источников. Агент сможет находить свежие публикации, отслеживать упоминания и делать дайджесты новостей по любой теме.",
    author: "NewsAPI.org",
    tools: ["search_news", "get_top_headlines", "get_sources"],
    category: "search",
    icon: "Newspaper",
    color: "#f97316",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Ваш NewsAPI ключ", type: "password", required: true },
    ],
  },

  // Communication
  {
    id: "telegram",
    name: "Отправка сообщений",
    connector: "Telegram",
    description: "Отправляет сообщения и уведомления в Telegram-каналы и чаты",
    longDescription: "Подключите Telegram-бота, чтобы агент мог отправлять сообщения, уведомления и файлы в каналы и личные чаты. Удобно для рассылок, алертов и автоматических отчётов.",
    author: "Telegram",
    tools: ["send_message", "send_photo", "send_document", "get_chat"],
    category: "communication",
    icon: "Send",
    color: "#0ea5e9",
    fields: [
      { key: "bot_token", label: "Bot Token", placeholder: "123456:ABC-DEF...", type: "password", required: true },
      { key: "chat_id", label: "Chat ID по умолчанию", placeholder: "-1001234567890", type: "text" },
    ],
  },
  {
    id: "email",
    name: "Отправка писем",
    connector: "Email / SMTP",
    description: "Составляет и отправляет письма через настроенный почтовый сервер",
    longDescription: "Позвольте агенту отправлять письма через ваш SMTP-сервер. Агент сможет составлять и рассылать письма, отвечать на запросы и отправлять отчёты на указанные адреса.",
    author: "SMTP",
    tools: ["send_email", "send_email_with_attachments"],
    category: "communication",
    icon: "Mail",
    color: "#0ea5e9",
    fields: [
      { key: "host", label: "SMTP Host", placeholder: "smtp.gmail.com", type: "text", required: true },
      { key: "port", label: "Port", placeholder: "587", type: "text", required: true },
      { key: "username", label: "Логин (email)", placeholder: "you@example.com", type: "text", required: true },
      { key: "password", label: "Пароль / App Password", placeholder: "••••••••", type: "password", required: true },
    ],
  },
  {
    id: "slack",
    name: "Slack-уведомления",
    connector: "Slack",
    description: "Постит сообщения в каналы и отправляет личные уведомления",
    longDescription: "Интегрируйте Slack, чтобы агент мог отправлять сообщения в каналы, упоминать пользователей и создавать треды. Отлично подходит для уведомлений команды и автоматических статус-апдейтов.",
    author: "Slack Technologies",
    tools: ["post_message", "post_in_thread", "list_channels", "get_user"],
    category: "communication",
    icon: "Hash",
    color: "#0ea5e9",
    fields: [
      { key: "bot_token", label: "Bot Token", placeholder: "xoxb-...", type: "password", required: true },
      { key: "default_channel", label: "Канал по умолчанию", placeholder: "#general", type: "text" },
    ],
  },

  // Data
  {
    id: "postgres",
    name: "SQL-запросы",
    connector: "PostgreSQL",
    description: "Читает и записывает данные в реляционную базу данных",
    longDescription: "Подключите PostgreSQL, чтобы агент мог выполнять SQL-запросы, читать таблицы и записывать результаты. Полезно для аналитики, отчётности и работы с бизнес-данными.",
    author: "PostgreSQL",
    tools: ["query", "execute", "list_tables", "describe_table"],
    category: "data",
    icon: "Database",
    color: "#6366f1",
    fields: [
      { key: "host", label: "Host", placeholder: "localhost", type: "text", required: true },
      { key: "port", label: "Port", placeholder: "5432", type: "text", required: true },
      { key: "database", label: "Database", placeholder: "mydb", type: "text", required: true },
      { key: "username", label: "Пользователь", placeholder: "postgres", type: "text", required: true },
      { key: "password", label: "Пароль", placeholder: "••••••••", type: "password", required: true },
    ],
  },
  {
    id: "google-sheets",
    name: "Google Таблицы",
    connector: "Google Sheets",
    description: "Читает и обновляет данные в Google Sheets по ID таблицы",
    longDescription: "Подключите Google Sheets, чтобы агент мог читать и записывать данные в таблицы. Удобно для ведения баз клиентов, отчётности и совместной работы с данными.",
    author: "Google",
    tools: ["read_range", "write_range", "append_rows", "list_sheets"],
    category: "data",
    icon: "Table2",
    color: "#6366f1",
    fields: [
      { key: "service_account_json", label: "Service Account JSON", placeholder: '{"type": "service_account", ...}', type: "textarea", required: true },
    ],
  },
  {
    id: "http",
    name: "HTTP-запросы",
    connector: "HTTP",
    description: "Обращается к любому внешнему REST API с настраиваемыми заголовками",
    longDescription: "Универсальный HTTP-коннектор позволяет агенту обращаться к любому REST API. Настройте базовый URL и заголовки авторизации — агент сможет делать GET, POST и другие запросы.",
    author: "Timeweb AI",
    tools: ["get", "post", "put", "delete", "patch"],
    category: "data",
    icon: "Globe",
    color: "#6366f1",
    fields: [
      { key: "base_url", label: "Base URL", placeholder: "https://api.example.com/v1", type: "text", required: true },
      { key: "auth_header", label: "Authorization Header", placeholder: "Bearer your-token", type: "password" },
    ],
  },

  // Productivity
  {
    id: "google-calendar",
    name: "Управление Calendar",
    connector: "Google Calendar",
    description: "Создаёт события, проверяет занятость и управляет встречами",
    longDescription: "Подключите Google Calendar, чтобы агент мог создавать события, проверять доступность времени и управлять встречами. Незаменимо для планирования и координации.",
    author: "Google",
    tools: ["create_event", "list_events", "update_event", "delete_event", "check_availability"],
    category: "productivity",
    icon: "CalendarDays",
    color: "#10b981",
    fields: [
      { key: "service_account_json", label: "Service Account JSON", placeholder: '{"type": "service_account", ...}', type: "textarea", required: true },
      { key: "calendar_id", label: "Calendar ID", placeholder: "primary", type: "text" },
    ],
  },
  {
    id: "notion",
    name: "Запись в Notion",
    connector: "Notion",
    description: "Создаёт и обновляет страницы, базы данных и блоки в Notion",
    longDescription: "Подключите Notion, чтобы агент мог создавать страницы, добавлять записи в базы данных и обновлять контент. Отлично для ведения заметок, CRM и управления задачами.",
    author: "Notion Labs",
    tools: ["create_page", "update_page", "query_database", "append_blocks"],
    category: "productivity",
    icon: "FileText",
    color: "#10b981",
    fields: [
      { key: "integration_token", label: "Integration Token", placeholder: "secret_...", type: "password", required: true },
      { key: "database_id", label: "Database ID (по умолчанию)", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
    ],
  },
  {
    id: "github",
    name: "GitHub Issues",
    connector: "GitHub",
    description: "Создаёт и обновляет задачи, читает PR и управляет репозиторием",
    longDescription: "Интегрируйте GitHub, чтобы агент мог создавать и комментировать issues, читать pull requests и управлять репозиторием. Удобно для автоматизации процессов разработки.",
    author: "GitHub",
    tools: ["create_issue", "list_issues", "add_comment", "list_pull_requests", "get_file"],
    category: "productivity",
    icon: "GitPullRequest",
    color: "#10b981",
    fields: [
      { key: "token", label: "Personal Access Token", placeholder: "ghp_...", type: "password", required: true },
      { key: "repo", label: "Репозиторий по умолчанию", placeholder: "owner/repo", type: "text" },
    ],
  },

  // Dev
  {
    id: "code-exec",
    name: "Выполнение кода",
    connector: "Code Sandbox",
    description: "Запускает Python и JavaScript в изолированной среде и возвращает результат",
    longDescription: "Code Sandbox позволяет агенту писать и запускать код прямо в диалоге. Агент может производить вычисления, обрабатывать данные и проверять свои ответы через выполнение кода.",
    author: "Timeweb AI",
    tools: ["run_python", "run_javascript", "install_package"],
    category: "dev",
    icon: "Code2",
    color: "#ec4899",
    fields: [],  // no config needed
  },
  {
    id: "browser",
    name: "Браузер",
    connector: "Headless Browser",
    description: "Открывает веб-страницы, читает контент и взаимодействует с элементами",
    longDescription: "Headless Browser даёт агенту возможность открывать веб-страницы, читать их содержимое, заполнять формы и делать скриншоты. Полезно для парсинга и автоматизации веб-задач.",
    author: "Timeweb AI",
    tools: ["navigate", "get_content", "click", "fill_form", "screenshot"],
    category: "dev",
    icon: "Monitor",
    color: "#ec4899",
    fields: [],  // no config needed
  },
]

export const CATEGORY_LABELS: Record<Skill["category"], string> = {
  search:        "Поиск",
  communication: "Коммуникации",
  data:          "Данные",
  productivity:  "Продуктивность",
  dev:           "Разработка",
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Skill["category"][]
