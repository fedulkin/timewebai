import type React from "react"
import {
  Bot, Zap, MessageSquare, Layers, Share2, BookOpen,
  MessageCircle, Network, Code2, GitBranch,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { OpenClawLogo, N8nLogo, OpenWebUILogo } from "@/components/solution-logos"

export type SolutionFeature = {
  icon: LucideIcon
  title: string
  description: string
}

export type SolutionStep = {
  number: string
  title: string
  description: string
}

export type Solution = {
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  license: string
  color: string
  darkColor?: string
  icon: React.ElementType
  features: SolutionFeature[]
  steps: SolutionStep[]
  useCases: string[]
  specs: string
  price: string
  comingSoon?: boolean
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "openclaw",
    name: "OpenClaw",
    tagline: "Разбирает почту, ведёт ресёрч, пишет ответы, планирует",
    description:
      "OpenClaw — персональный AI-агент на вашем сервере. Он подключается к почте, календарю, Telegram и Notion, самостоятельно выполняет многошаговые задачи и ведёт журнал действий с возможностью отката за 24 часа. 30 готовых умений без единой строки кода.",
    category: "Персональный ИИ",
    license: "MIT",
    color: "#ff4d4d",
    icon: OpenClawLogo,
    price: "От 1 990 ₽/мес",
    specs: "От 2 vCPU / 4 GB RAM",
    useCases: [
      "Обработка входящей почты",
      "Планирование встреч и задач",
      "Ресёрч и сбор информации",
      "Управление заметками в Notion",
    ],
    features: [
      {
        icon: MessageSquare,
        title: "Умные ответы на почту",
        description: "Агент читает входящие письма, понимает контекст и составляет черновики ответов на естественном языке.",
      },
      {
        icon: Zap,
        title: "Многошаговые задачи",
        description: "Выполняет цепочки действий автономно: нашёл информацию → записал в Notion → отправил письмо.",
      },
      {
        icon: BookOpen,
        title: "Журнал с откатом",
        description: "Каждое действие логируется. Если что-то пошло не так, можно откатиться к любому состоянию за 24 часа.",
      },
      {
        icon: Share2,
        title: "30 готовых умений",
        description: "Яндекс Почта, Google Calendar, Telegram, Notion, веб-поиск и многое другое — без настройки кода.",
      },
      {
        icon: Network,
        title: "Планировщик задач",
        description: "Ставьте задачи в очередь, назначайте дедлайны — агент сам решит, когда и как их выполнить.",
      },
      {
        icon: GitBranch,
        title: "Интеграция за 30 секунд",
        description: "Подключение к Яндекс Почте, Calendar, Telegram и Notion через готовые OAuth-коннекторы.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Разверните инстанс",
        description: "OpenClaw запускается на вашем сервере Timeweb с готовой конфигурацией и веб-интерфейсом за несколько минут.",
      },
      {
        number: "02",
        title: "Подключите сервисы",
        description: "Привяжите почту, календарь, Telegram и Notion через OAuth — без ключей API и настройки вручную.",
      },
      {
        number: "03",
        title: "Поставьте задачу",
        description: "Напишите агенту на естественном языке что нужно сделать. Он составит план и выполнит самостоятельно.",
      },
    ],
  },
  {
    slug: "n8n",
    name: "n8n",
    tagline: "Автоматизирует рутину через визуальные воркфлоу",
    description:
      "n8n — open-source платформа автоматизации с визуальным редактором. Интегрирована с YandexGPT, GigaChat и Yandex Vision для обработки документов и изображений. 400+ встроенных интеграций и готовые сценарии для счетов, договоров и аналитики.",
    category: "Автоматизация",
    license: "Sustainable Use",
    color: "#fd8925",
    icon: N8nLogo,
    price: "От 1 990 ₽/мес",
    specs: "От 2 vCPU / 4 GB RAM",
    useCases: [
      "Распознавание и обработка документов",
      "Автоматизация обработки счетов",
      "Синхронизация данных между системами",
      "Уведомления и алерты по событиям",
    ],
    features: [
      {
        icon: Layers,
        title: "Визуальный редактор",
        description: "Строите воркфлоу перетаскиванием блоков. Никакого YAML и кода — только логика бизнес-процесса.",
      },
      {
        icon: Network,
        title: "400+ интеграций",
        description: "Подключается к CRM, таблицам, мессенджерам, облачным хранилищам и десяткам других сервисов.",
      },
      {
        icon: BookOpen,
        title: "Распознавание документов",
        description: "Yandex Vision извлекает поля из счетов, договоров и накладных — результат попадает в нужную систему.",
      },
      {
        icon: Bot,
        title: "YandexGPT и GigaChat",
        description: "Добавляйте AI-ноды в любое место воркфлоу: резюмирование, классификация, генерация текста.",
      },
      {
        icon: Zap,
        title: "Готовые сценарии",
        description: "Библиотека шаблонов: обработка входящих счетов, мониторинг упоминаний, ежедневные отчёты.",
      },
      {
        icon: GitBranch,
        title: "Self-hosted",
        description: "Все данные остаются на вашем сервере. Нет лимитов на количество воркфлоу и запусков.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Разверните n8n",
        description: "Инстанс поднимается одной кнопкой в панели Timeweb. Доступ через браузер сразу после запуска.",
      },
      {
        number: "02",
        title: "Выберите шаблон",
        description: "Откройте библиотеку готовых воркфлоу и выберите подходящий под вашу задачу сценарий.",
      },
      {
        number: "03",
        title: "Настройте и запустите",
        description: "Подключите нужные сервисы через OAuth, настройте параметры и включите автоматический запуск.",
      },
    ],
  },
  {
    slug: "openwebui",
    name: "Open WebUI",
    tagline: "Чат-интерфейс для LLM с RAG по документам",
    description:
      "Open WebUI — современный self-hosted чат-клиент для языковых моделей. Поддерживает несколько моделей одновременно, RAG по загруженным документам и личные рабочие пространства для команды. Выглядит как ChatGPT, работает на ваших данных.",
    category: "Чат",
    license: "MIT",
    color: "#000000",
    darkColor: "#ffffff",
    icon: OpenWebUILogo,
    price: "От 1 990 ₽/мес",
    specs: "От 1 vCPU / 2 GB RAM",
    useCases: [
      "Корпоративный чат-ассистент",
      "Ответы по внутренней документации",
      "Личные рабочие пространства команды",
      "Сравнение ответов разных моделей",
    ],
    features: [
      {
        icon: MessageSquare,
        title: "Несколько моделей",
        description: "Переключайтесь между GPT-4o, Claude, YandexGPT, GigaChat и локальными моделями Ollama в одном интерфейсе.",
      },
      {
        icon: BookOpen,
        title: "RAG по документам",
        description: "Загружайте PDF, Word, Markdown — модель отвечает на вопросы с опорой на ваши документы и указывает источник.",
      },
      {
        icon: Layers,
        title: "Личные пространства",
        description: "Каждый пользователь работает в своём пространстве с отдельной историей и настройками.",
      },
      {
        icon: Share2,
        title: "История диалогов",
        description: "Все разговоры сохраняются, доступны для поиска и экспорта. Ничего не теряется.",
      },
      {
        icon: Code2,
        title: "Markdown и код",
        description: "Красивая подсветка кода, формулы LaTeX и форматированный вывод прямо в чате.",
      },
      {
        icon: Bot,
        title: "Кастомные персонажи",
        description: "Создавайте AI-персонажей с заданным системным промптом и делитесь ими с командой.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Разверните Open WebUI",
        description: "Запускается в одно действие. Сразу доступен веб-интерфейс с поддержкой авторизации.",
      },
      {
        number: "02",
        title: "Подключите модели",
        description: "Добавьте API-ключи нужных провайдеров или подключите локальный Ollama для работы офлайн.",
      },
      {
        number: "03",
        title: "Загрузите документы",
        description: "Добавьте корпоративную документацию в базу знаний и начните задавать вопросы.",
      },
    ],
  },
  {
    slug: "dify",
    name: "Dify",
    tagline: "Создавайте и публикуйте LLM-приложения без кода",
    description:
      "Dify — платформа для разработки LLM-приложений с визуальным редактором промптов, цепочек и агентов. Мгновенно создаёт API-эндпоинты, поддерживает встроенные тесты качества и деплой в один клик.",
    category: "Конструктор",
    license: "Apache 2.0",
    color: "#10b981",
    icon: Layers,
    price: "От 1 990 ₽/мес",
    specs: "От 2 vCPU / 4 GB RAM",
    useCases: [
      "Чат-боты для сайта и поддержки",
      "Автоматизация генерации контента",
      "Внутренние AI-инструменты для команды",
      "RAG-приложения на корпоративных данных",
    ],
    features: [
      {
        icon: Layers,
        title: "Визуальный редактор",
        description: "Собирайте LLM-приложения из блоков: промпты, условия, циклы, вызовы инструментов — на одном канвасе.",
      },
      {
        icon: Code2,
        title: "API одной кнопкой",
        description: "Каждое приложение сразу получает REST API с документацией. Встраивайте в любые системы без доработки.",
      },
      {
        icon: GitBranch,
        title: "Тесты качества",
        description: "Встроенный фреймворк для оценки ответов — запускайте регрессионные тесты после каждого изменения промпта.",
      },
      {
        icon: BookOpen,
        title: "RAG Pipeline",
        description: "Загружайте документы, настраивайте чанкинг и эмбеддинги — готовый RAG без настройки векторной БД.",
      },
      {
        icon: Bot,
        title: "Агенты и цепочки",
        description: "Строите сложные агентные системы с памятью, инструментами и многошаговым рассуждением.",
      },
      {
        icon: Network,
        title: "Аналитика",
        description: "Дашборд с метриками использования, стоимостью запросов и качеством ответов в реальном времени.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Разверните Dify",
        description: "Self-hosted инстанс с полной функциональностью поднимается за несколько минут на вашем сервере.",
      },
      {
        number: "02",
        title: "Создайте приложение",
        description: "Выберите тип (чат-бот, агент, воркфлоу), настройте промпты и подключите базу знаний.",
      },
      {
        number: "03",
        title: "Опубликуйте API",
        description: "Нажмите «Опубликовать» — получите готовый API-эндпоинт и виджет для встраивания на сайт.",
      },
    ],
  },
  {
    slug: "flowise",
    name: "Flowise",
    tagline: "Визуальный конструктор AI-агентов с памятью и RAG",
    description:
      "Flowise позволяет строить AI-агентов с долгосрочной памятью и RAG по документам. Задеплойте агента на сайт, в Telegram или через API за несколько кликов. Поддерживает YandexGPT, GigaChat и Ollama.",
    category: "Воркфлоу",
    license: "Apache 2.0",
    color: "#3b82f6",
    icon: Share2,
    price: "От 1 990 ₽/мес",
    specs: "От 2 vCPU / 4 GB RAM",
    useCases: [
      "Агенты поддержки на сайте",
      "Telegram-боты с памятью",
      "RAG-системы с цитированием",
      "Прототипирование AI-продуктов",
    ],
    features: [
      {
        icon: Share2,
        title: "Визуальный конструктор",
        description: "Drag-and-drop редактор: соединяйте ноды LLM, памяти, инструментов и документов в граф агента.",
      },
      {
        icon: BookOpen,
        title: "Долгосрочная память",
        description: "Агент помнит контекст между сессиями и персонализирует ответы на основе истории общения.",
      },
      {
        icon: Layers,
        title: "RAG с источниками",
        description: "Загружайте PDF и сайты, агент отвечает со ссылками на конкретные фрагменты документов.",
      },
      {
        icon: Network,
        title: "Три канала деплоя",
        description: "Публикуйте агента как виджет на сайт, Telegram-бот или REST API — одним переключателем.",
      },
      {
        icon: Bot,
        title: "YandexGPT и GigaChat",
        description: "Нативная поддержка российских моделей, а также Ollama для работы полностью без интернета.",
      },
      {
        icon: Code2,
        title: "Кастомные инструменты",
        description: "Добавляйте собственные Python/JS-ноды и HTTP-запросы к внешним API в граф агента.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Разверните Flowise",
        description: "Инстанс с готовым UI доступен по вашему домену сразу после запуска на Timeweb.",
      },
      {
        number: "02",
        title: "Соберите агента",
        description: "Перетащите ноды LLM, памяти и RAG на канвас, соедините их и настройте системный промпт.",
      },
      {
        number: "03",
        title: "Задеплойте",
        description: "Выберите канал (сайт, Telegram или API) и получите готовый код для встраивания.",
      },
    ],
  },
  {
    slug: "anythingllm",
    name: "AnythingLLM",
    tagline: "Загружайте документы и задавайте вопросы по базе знаний",
    description:
      "AnythingLLM — self-hosted инструмент для работы с базой знаний. Загружайте PDF, веб-страницы, экспорты Notion и Confluence, а затем общайтесь с документами в изолированных рабочих пространствах. Ответы всегда со ссылкой на источник.",
    category: "База знаний",
    license: "MIT",
    color: "#8b5cf6",
    icon: BookOpen,
    price: "От 1 990 ₽/мес",
    specs: "От 2 vCPU / 4 GB RAM",
    useCases: [
      "Корпоративная база знаний",
      "Ответы по документации продукта",
      "Анализ юридических и финансовых документов",
      "Изолированные пространства для команд",
    ],
    features: [
      {
        icon: BookOpen,
        title: "Любые форматы",
        description: "PDF, Word, TXT, Markdown, веб-страницы, экспорты Notion и Confluence — всё загружается в несколько кликов.",
      },
      {
        icon: Layers,
        title: "Изоляция пространств",
        description: "Каждый проект или команда работает в своём пространстве с отдельными документами и историей.",
      },
      {
        icon: MessageSquare,
        title: "Ответы с источниками",
        description: "Агент всегда указывает, из какого документа и страницы взят ответ — никакой «галлюцинации» без контроля.",
      },
      {
        icon: Share2,
        title: "Командный доступ",
        description: "Управление ролями и правами: администраторы, редакторы и читатели с разным уровнем доступа.",
      },
      {
        icon: Bot,
        title: "Мультимодельность",
        description: "Подключите GPT-4o, Claude, YandexGPT, GigaChat или локальную модель через Ollama.",
      },
      {
        icon: Code2,
        title: "Без утечки данных",
        description: "Все документы и векторы хранятся только на вашем сервере. Внешние API видят только запросы, не данные.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Разверните AnythingLLM",
        description: "Self-hosted инстанс с веб-интерфейсом и встроенной векторной БД — всё в одном контейнере.",
      },
      {
        number: "02",
        title: "Загрузите документы",
        description: "Перетащите файлы или укажите URL — система автоматически проиндексирует и разобьёт на чанки.",
      },
      {
        number: "03",
        title: "Начните диалог",
        description: "Задавайте вопросы в чате — агент найдёт ответ в документах и покажет источник.",
      },
    ],
  },
]

export const COMING_SOON: Pick<Solution, "slug" | "name" | "tagline" | "icon" | "category" | "color">[] = [
  {
    slug: "librechat",
    name: "LibreChat",
    tagline: "Расширенный чат-клиент с поддержкой плагинов",
    icon: MessageCircle,
    category: "Чат",
    color: "#6366f1",
  },
  {
    slug: "langflow",
    name: "Langflow",
    tagline: "Визуальный редактор LangChain-пайплайнов",
    icon: Network,
    category: "Конструктор",
    color: "#ec4899",
  },
  {
    slug: "lobechat",
    name: "LobeChat",
    tagline: "Современный чат с плагинами и мультимодальностью",
    icon: Bot,
    category: "Чат",
    color: "#0891b2",
  },
  {
    slug: "continue",
    name: "Continue.dev",
    tagline: "AI-ассистент для написания кода прямо в IDE",
    icon: Code2,
    category: "Разработка",
    color: "#16a34a",
  },
]
