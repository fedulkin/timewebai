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
  website?: string
  docs?: string
  instructions?: string
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
    website: "https://brave.com/search/api/",
    docs: "https://api.search.brave.com/app/documentation/web-search/get-started",
    instructions: `# Получение API-ключа

1. Перейдите на сайт brave.com/search/api и нажмите «Get started»
2. Зарегистрируйтесь или войдите в аккаунт Brave
3. В личном кабинете перейдите в раздел API Keys
4. Нажмите «New Key», задайте название и выберите тарифный план
5. Скопируйте сгенерированный ключ — он начинается с «BSA»

> Бесплатный тариф включает 2 000 запросов в месяц. Ключ показывается только один раз — сохраните его сразу.`,
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
    website: "https://newsapi.org",
    docs: "https://newsapi.org/docs",
    instructions: `# Получение API-ключа

1. Откройте newsapi.org и нажмите «Get API Key»
2. Заполните форму регистрации и подтвердите email
3. После входа API-ключ отображается прямо на главной странице личного кабинета
4. Скопируйте ключ и вставьте его в поле выше

> Бесплатный план ограничен 100 запросами в сутки и даёт доступ к новостям с задержкой 24 часа. Для realtime-данных нужен платный тариф.`,
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
    website: "https://core.telegram.org/bots",
    docs: "https://core.telegram.org/bots/api",
    instructions: `# Создание бота и получение токена

1. Откройте Telegram и найдите бота @BotFather
2. Отправьте команду /newbot
3. Задайте имя бота (например: «My Assistant») и username (должен заканчиваться на bot)
4. BotFather выдаст токен вида 123456789:AAF...xyz — скопируйте его

# Получение Chat ID

1. Добавьте бота в нужный чат или канал и назначьте его администратором
2. Отправьте любое сообщение в этот чат
3. Откройте в браузере: https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
4. В ответе найдите поле "chat" → "id" — это и есть Chat ID

> Для личного чата с ботом просто напишите ему /start, Chat ID будет совпадать с вашим Telegram ID.`,
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
    docs: "https://datatracker.ietf.org/doc/html/rfc5321",
    instructions: `# Настройка для Gmail

1. Включите двухфакторную аутентификацию в аккаунте Google
2. Перейдите: Аккаунт Google → Безопасность → Пароли приложений
3. Выберите «Другое (введите название)», задайте имя и нажмите «Создать»
4. Скопируйте сгенерированный 16-значный пароль

Параметры подключения:
- Host: smtp.gmail.com
- Port: 587
- Логин: ваш gmail-адрес
- Пароль: пароль приложения из шага 4

# Другие провайдеры

- Яндекс.Почта — smtp.yandex.ru, порт 587
- Mail.ru — smtp.mail.ru, порт 587
- Outlook / Hotmail — smtp.office365.com, порт 587

> Используйте пароль приложения, а не основной пароль от почты.`,
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
    website: "https://api.slack.com",
    docs: "https://api.slack.com/docs",
    instructions: `# Создание Slack-приложения

1. Перейдите на api.slack.com/apps и нажмите «Create New App» → «From scratch»
2. Задайте имя приложения и выберите воркспейс
3. В меню слева откройте OAuth & Permissions
4. В разделе Bot Token Scopes добавьте права: chat:write, channels:read, users:read
5. Нажмите «Install to Workspace» и подтвердите установку
6. Скопируйте Bot User OAuth Token — он начинается с xoxb-

# Канал по умолчанию

Укажите канал в формате #название (например, #general) или ID канала.

> Бот должен быть приглашён в канал командой /invite @имя_бота, иначе он не сможет отправлять сообщения.`,
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
    website: "https://www.postgresql.org",
    docs: "https://www.postgresql.org/docs/current/",
    instructions: `# Подготовка базы данных

1. Убедитесь, что PostgreSQL доступен извне (или настройте туннель)
2. Создайте отдельного пользователя с минимальными правами:

CREATE USER agent_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE mydb TO agent_user;
GRANT USAGE ON SCHEMA public TO agent_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO agent_user;

3. В файле pg_hba.conf разрешите подключение с нужного IP
4. Перезапустите PostgreSQL после изменений

# Параметры подключения

- Host: IP-адрес или домен сервера
- Port: 5432 (по умолчанию)
- Database: имя базы данных
- User / Password: данные из шага 2

> Не используйте пользователя postgres — создайте отдельного с ограниченными правами.`,
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
    website: "https://workspace.google.com/products/sheets/",
    docs: "https://developers.google.com/sheets/api/guides/concepts",
    instructions: `# Создание сервисного аккаунта

1. Откройте console.cloud.google.com и создайте или выберите проект
2. Перейдите в APIs & Services → Library, найдите «Google Sheets API» и включите его
3. Откройте APIs & Services → Credentials → Create Credentials → Service Account
4. Задайте имя, нажмите «Create and Continue», роль можно пропустить
5. В списке сервисных аккаунтов нажмите на созданный, перейдите в Keys → Add Key → JSON
6. Скачайте JSON-файл и вставьте его содержимое в поле выше

# Доступ к таблице

Откройте нужную Google Таблицу и нажмите «Настроить доступ». Добавьте email сервисного аккаунта (вида name@project-id.iam.gserviceaccount.com) с правами редактора.

> Без этого шага агент не сможет читать данные из таблицы.`,
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
    instructions: `# Настройка подключения

1. Укажите Base URL вашего API — обычно это адрес без конкретного эндпоинта (например, https://api.example.com/v1)
2. Если API требует авторизации, укажите заголовок Authorization в поле выше

# Форматы авторизации

- Bearer-токен: Bearer ваш_токен
- API-ключ: ApiKey ваш_ключ
- Basic Auth: Basic base64(login:password)

> Агент будет добавлять этот заголовок ко всем запросам автоматически.`,
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
    website: "https://workspace.google.com/products/calendar/",
    docs: "https://developers.google.com/calendar/api/guides/overview",
    instructions: `# Создание сервисного аккаунта

1. Откройте console.cloud.google.com и создайте или выберите проект
2. Перейдите в APIs & Services → Library, найдите «Google Calendar API» и включите его
3. Откройте APIs & Services → Credentials → Create Credentials → Service Account
4. Задайте имя и нажмите «Create and Continue»
5. В списке сервисных аккаунтов перейдите в Keys → Add Key → JSON
6. Скачайте JSON-файл и вставьте его содержимое в поле выше

# Предоставление доступа к календарю

1. Откройте Google Calendar и перейдите в настройки нужного календаря
2. В разделе «Права доступа» добавьте email сервисного аккаунта
3. Выберите роль «Вносить изменения в мероприятия»
4. Calendar ID для основного календаря — primary

> Для корпоративных аккаунтов Google Workspace администратор должен разрешить доступ сервисным аккаунтам.`,
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
    website: "https://www.notion.so",
    docs: "https://developers.notion.com",
    instructions: `# Создание интеграции

1. Перейдите на notion.so/my-integrations и нажмите «New integration»
2. Задайте название, выберите воркспейс и нажмите «Submit»
3. Скопируйте Internal Integration Token — он начинается с secret_

# Доступ к базе данных

1. Откройте нужную базу данных в Notion
2. Нажмите ··· в правом верхнем углу → «Add connections»
3. Найдите вашу интеграцию и нажмите «Confirm»
4. Database ID — это часть URL между последним / и ? (32 символа)

Например, в URL notion.so/myworkspace/abc123def456...?v=... Database ID — это abc123def456...

> Без подключения интеграции к базе данных агент не сможет читать или записывать данные.`,
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
    website: "https://github.com",
    docs: "https://docs.github.com/en/rest",
    instructions: `# Создание Personal Access Token

1. Войдите в GitHub и откройте Settings → Developer settings
2. Выберите Personal access tokens → Tokens (classic) → Generate new token
3. Задайте название, выберите срок действия
4. Выберите права: repo (полный доступ) или как минимум issues и pull_requests
5. Нажмите «Generate token» и сразу скопируйте — токен показывается только один раз

# Репозиторий по умолчанию

Укажите в формате owner/repo (например, mycompany/backend). Агент будет использовать его, если в запросе не указан другой репозиторий.

> Для организаций может потребоваться подтверждение SSO. Нажмите «Authorize» рядом с организацией после генерации токена.`,
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
