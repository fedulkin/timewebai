export type Model = {
  id: string
  provider: string
  context: number
  maxOut: number
  read: string
  write: string
  rating: number
  description: string
  capabilities: string[]
  license: "Проприетарная" | "Open Source"
  params: string | null
  released: string
  modalities: string[]
  bestFor: string[]
  speed: "Высокая" | "Средняя" | "Низкая"
}

export const models: Model[] = [
  {
    id: "deepseek/deepseek-v3.2",
    provider: "deepseek",
    context: 164,
    maxOut: 66,
    read: "36₽",
    write: "149₽",
    rating: 4,
    description:
      "Флагманская модель DeepSeek с улучшенными возможностями в кодировании, математике и многоязычных задачах. Обновлённая версия с расширенным контекстным окном и повышенной точностью следования инструкциям.",
    capabilities: ["Текст", "Код", "Математика", "Многоязычность"],
    license: "Open Source",
    params: "671B MoE",
    released: "2025",
    modalities: ["Текст"],
    bestFor: ["Генерация кода", "Математические задачи", "Многоязычные проекты"],
    speed: "Средняя",
  },
  {
    id: "deepseek/deepseek-v3.2-thinking",
    provider: "deepseek",
    context: 164,
    maxOut: 66,
    read: "48₽",
    write: "192₽",
    rating: 5,
    description:
      "Версия DeepSeek V3.2 с усиленной цепочкой рассуждений (Chain-of-Thought). Перед ответом модель разворачивает внутренний ход мыслей, что значительно повышает точность в сложных аналитических и математических задачах.",
    capabilities: ["Текст", "Код", "Математика", "Рассуждение"],
    license: "Open Source",
    params: "671B MoE",
    released: "2025",
    modalities: ["Текст"],
    bestFor: ["Сложная аналитика", "Олимпиадные задачи", "Научные расчёты"],
    speed: "Низкая",
  },
  {
    id: "openai/o3-deep-research",
    provider: "openai",
    context: 200,
    maxOut: 100,
    read: "120₽",
    write: "480₽",
    rating: 5,
    description:
      "Специализированная модель OpenAI для глубокого исследования и многоэтапного анализа. Способна самостоятельно синтезировать информацию из длинного контекста и создавать детальные аналитические отчёты.",
    capabilities: ["Текст", "Исследование", "Анализ", "Рассуждение"],
    license: "Проприетарная",
    params: null,
    released: "2025",
    modalities: ["Текст"],
    bestFor: ["Исследования и отчёты", "Стратегический анализ", "Академические работы"],
    speed: "Низкая",
  },
  {
    id: "openai/gpt-5.4-mini",
    provider: "openai",
    context: 128,
    maxOut: 16,
    read: "12₽",
    write: "48₽",
    rating: 3,
    description:
      "Быстрая и экономичная версия GPT-5.4 для задач, не требующих максимальной мощности. Оптимальный баланс скорости и качества для высоконагруженных приложений и чат-ботов.",
    capabilities: ["Текст", "Код", "Быстрый ответ"],
    license: "Проприетарная",
    params: null,
    released: "2025",
    modalities: ["Текст", "Изображения"],
    bestFor: ["Чат-боты", "Классификация текста", "Быстрые ответы"],
    speed: "Высокая",
  },
  {
    id: "openai/gpt-5.4",
    provider: "openai",
    context: 128,
    maxOut: 32,
    read: "60₽",
    write: "240₽",
    rating: 4,
    description:
      "Флагманская модель OpenAI с расширенными возможностями рассуждения, глубокого понимания контекста и генерации кода. Подходит для сложных многоэтапных задач и профессионального ассистирования.",
    capabilities: ["Текст", "Код", "Рассуждение", "Анализ"],
    license: "Проприетарная",
    params: null,
    released: "2025",
    modalities: ["Текст", "Изображения"],
    bestFor: ["Разработка ПО", "Бизнес-анализ", "Копирайтинг"],
    speed: "Средняя",
  },
  {
    id: "anthropic/claude-4-opus",
    provider: "anthropic",
    context: 200,
    maxOut: 32,
    read: "90₽",
    write: "450₽",
    rating: 5,
    description:
      "Самая мощная модель Anthropic с расширенными аналитическими способностями, глубоким пониманием нюансов и точным следованием сложным инструкциям. Лучший выбор для задач, требующих экспертного уровня.",
    capabilities: ["Текст", "Код", "Анализ", "Рассуждение"],
    license: "Проприетарная",
    params: null,
    released: "2025",
    modalities: ["Текст", "Изображения"],
    bestFor: ["Юридический анализ", "Сложные инструкции", "Длинные документы"],
    speed: "Средняя",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    provider: "anthropic",
    context: 200,
    maxOut: 8,
    read: "18₽",
    write: "90₽",
    rating: 4,
    description:
      "Сбалансированная модель Anthropic, сочетающая высокое качество с разумной стоимостью. Отличные результаты в задачах анализа, написания текстов и работы с кодом при умеренных затратах.",
    capabilities: ["Текст", "Код", "Анализ"],
    license: "Проприетарная",
    params: null,
    released: "2024",
    modalities: ["Текст", "Изображения"],
    bestFor: ["Написание текстов", "Ревью кода", "Анализ данных"],
    speed: "Высокая",
  },
  {
    id: "google/gemini-2.5-pro",
    provider: "google",
    context: 1000,
    maxOut: 64,
    read: "18₽",
    write: "72₽",
    rating: 4,
    description:
      "Флагманская модель Google с рекордным контекстным окном в 1 миллион токенов. Поддерживает мультимодальные задачи, включая анализ изображений, и справляется со сложным многоэтапным анализом больших документов.",
    capabilities: ["Текст", "Код", "Мультимодальность", "Длинный контекст"],
    license: "Проприетарная",
    params: null,
    released: "2025",
    modalities: ["Текст", "Изображения", "Видео", "Аудио"],
    bestFor: ["Анализ больших документов", "Мультимодальные задачи", "Видео-анализ"],
    speed: "Средняя",
  },
  {
    id: "google/gemini-2.5-flash",
    provider: "google",
    context: 1000,
    maxOut: 64,
    read: "4₽",
    write: "16₽",
    rating: 3,
    description:
      "Быстрая и доступная модель Google с контекстным окном 1 млн токенов. Оптимальный выбор для задач, требующих обработки большого объёма текстовых данных при минимальных затратах.",
    capabilities: ["Текст", "Код", "Длинный контекст", "Быстрый ответ"],
    license: "Проприетарная",
    params: null,
    released: "2025",
    modalities: ["Текст", "Изображения"],
    bestFor: ["Обработка больших объёмов", "RAG-системы", "Суммаризация"],
    speed: "Высокая",
  },
  {
    id: "mistral/mistral-large-2",
    provider: "mistral",
    context: 128,
    maxOut: 16,
    read: "24₽",
    write: "72₽",
    rating: 3,
    description:
      "Флагманская модель Mistral AI с отличными результатами в работе с кодом, математическими задачами и многоязычным контентом. Европейская разработка с акцентом на конфиденциальность данных.",
    capabilities: ["Текст", "Код", "Математика", "Многоязычность"],
    license: "Проприетарная",
    params: "123B",
    released: "2024",
    modalities: ["Текст"],
    bestFor: ["Европейский compliance", "Многоязычный контент", "Function calling"],
    speed: "Высокая",
  },
  {
    id: "meta/llama-3.3-70b-instruct",
    provider: "meta",
    context: 128,
    maxOut: 32,
    read: "6₽",
    write: "12₽",
    rating: 2,
    description:
      "Открытая модель Meta с 70 млрд параметров, настроенная для точного следования инструкциям. Один из лучших открытых вариантов по соотношению качества и стоимости.",
    capabilities: ["Текст", "Код", "Open source"],
    license: "Open Source",
    params: "70B",
    released: "2024",
    modalities: ["Текст"],
    bestFor: ["Self-hosted решения", "Бюджетные проекты", "Базовые чат-боты"],
    speed: "Высокая",
  },
  {
    id: "qwen/qwen2.5-72b-instruct",
    provider: "qwen",
    context: 128,
    maxOut: 8,
    read: "8₽",
    write: "24₽",
    rating: 2,
    description:
      "Мощная открытая модель от Alibaba Cloud с особым акцентом на многоязычные задачи. Показывает сильные результаты в работе с китайским языком и задачах, требующих понимания азиатского культурного контекста.",
    capabilities: ["Текст", "Многоязычность", "Open source"],
    license: "Open Source",
    params: "72B",
    released: "2024",
    modalities: ["Текст"],
    bestFor: ["Азиатские рынки", "Китайский язык", "Open source проекты"],
    speed: "Высокая",
  },
]

export const providerColors: Record<string, string> = {
  deepseek:  "bg-blue-500",
  openai:    "bg-zinc-800 border border-white/20",
  anthropic: "bg-orange-600",
  google:    "bg-emerald-600",
  mistral:   "bg-violet-600",
  meta:      "bg-sky-600",
  qwen:      "bg-rose-600",
}

export const providerInitials: Record<string, string> = {
  deepseek:  "DS",
  openai:    "OA",
  anthropic: "AN",
  google:    "GG",
  mistral:   "MI",
  meta:      "ME",
  qwen:      "QW",
}

export const providerNames: Record<string, string> = {
  deepseek:  "DeepSeek",
  openai:    "OpenAI",
  anthropic: "Anthropic",
  google:    "Google",
  mistral:   "Mistral AI",
  meta:      "Meta",
  qwen:      "Alibaba Cloud",
}

export function fmtK(k: number) {
  return k >= 1000 ? `${k / 1000} M` : `${k}K`
}

export function getModelById(id: string): Model | undefined {
  return models.find((m) => m.id === id)
}
