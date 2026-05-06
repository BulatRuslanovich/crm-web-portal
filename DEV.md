# Локальный запуск

Памятка для разработчиков: как поднять портал на своей машине.

## Содержание

- [Требования](#требования)
- [Клонирование и установка зависимостей](#1-клонирование-и-установка-зависимостей)
- [Поднять бэкенд](#2-поднять-бэкенд)
- [Настроить переменные окружения](#3-настроить-переменные-окружения)
- [Запуск](#4-запуск)
- [Проверка](#5-проверка)
- [Production-сборка](#production-сборка)
- [Линтинг и форматирование](#линтинг-и-форматирование)
- [Структура проекта](#структура-проекта)
- [Архитектурная схема](#архитектурная-схема)
- [Частые проблемы](#частые-проблемы)

---

## Требования

- [Node.js 20](https://nodejs.org/) (та же версия, что в [Dockerfile](Dockerfile))
- npm 10+ (идёт с Node 20)
- (опционально) [Docker](https://docs.docker.com/get-docker/) — если бэк запускаешь в контейнере

Проверить:

```bash
node -v
# v20.x.x
npm -v
# 10.x.x
```

---

## 1. Клонирование и установка зависимостей

```bash
git clone <repo-url> crm-web-portal
cd crm-web-portal
npm install
```

`package-lock.json` нужно коммитить — в CI и Docker используется `npm ci`.

---

## 2. Настроить переменные окружения

Создай файл `.env.local` в корне (не коммитится):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` используется браузерным API-клиентом ([lib/api/browser-client.ts](lib/api/browser-client.ts)).
`API_URL` используется серверным API-клиентом ([lib/api/server-client.ts](lib/api/server-client.ts)); если не задан, берётся `NEXT_PUBLIC_API_URL`.
`NEXT_PUBLIC_SITE_URL` используется для metadata, sitemap и robots.

> **Важно:** `NEXT_PUBLIC_*` встраивается в бандл при сборке. После смены — перезапусти `npm run dev` (или пересобери `npm run build`).

---

## 4. Запуск

**Dev-сервер с HMR:**

```bash
npm run dev
```

Портал поднимется на [http://localhost:3000](http://localhost:3000).

**Дебаг в VS Code:** конфиг `.vscode/launch.json` для Chrome:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Next.js: debug client",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

**Server-side отладка:**

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Подключись через `chrome://inspect`.

---

## 5. Проверка

Открой [http://localhost:3000](http://localhost:3000) — должен появиться экран входа.

Зарегистрируйся / войди. `accessToken` сохраняется в `localStorage`, refresh-сессия приходит через cookie от API. Browser axios-interceptor ([lib/api/browser-client.ts](lib/api/browser-client.ts)) автоматически обновит access token на 401.

**Ручной сброс сессии:** DevTools → Application → Local Storage → удалить `accessToken`; при необходимости также очистить cookies API-домена.

---

## Production-сборка

```bash
npm run build
npm run start
```

`build` создаёт `.next/standalone` — его использует [Dockerfile](Dockerfile).

Проверка сборки в Docker:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000 -t crm-web-portal .
docker run --rm -p 3000:3000 crm-web-portal
```

---

## Линтинг и форматирование

```bash
npm run lint          # ESLint
npm run format        # Prettier — автоформат
npm run format:check  # Prettier — проверка
```

| Инструмент   | Конфиг                                                                     |
| ------------ | -------------------------------------------------------------------------- |
| ESLint       | [eslint.config.mjs](eslint.config.mjs) (flat config, `eslint-config-next`) |
| Prettier     | [prettier.config.mjs](prettier.config.mjs) + `prettier-plugin-tailwindcss` |
| EditorConfig | [.editorconfig](.editorconfig)                                             |

В IDE стоит включить: формат по сохранению (Prettier), ESLint-on-the-fly, Tailwind CSS IntelliSense.

---

## Структура проекта

```
crm-web-portal/
├── app/
│   ├── (auth)/         — страницы авторизации
│   ├── (main)/         — защищённые страницы
│   └── layout.tsx      — корневой layout, metadata
├── components/         — переиспользуемые UI-компоненты
├── lib/
│   ├── api/            — API-клиенты (axios + ресурсы)
│   ├── auth-context.tsx — контекст авторизации (JWT + refresh)
│   ├── hooks/          — клиентские хуки
│   │   ├── use-api.ts      — хук запросов к API
│   │   ├── use-entity.ts   — хук CRUD-операций
│   │   ├── use-set-diff.ts — хук отслеживания изменений набора
│   │   └── use-roles.ts    — роли текущего пользователя
│   ├── export.ts       — экспорт отчётов в CSV/XLSX
│   └── format.ts       — форматирование дат/значений
├── next.config.ts      — React Compiler, standalone output
└── Dockerfile          — multi-stage сборка
```

---

## Архитектурная схема

### Auth flow

- `AuthProvider` ([lib/auth-context.tsx](lib/auth-context.tsx)) живёт на клиенте и хранит текущего пользователя, `isAuthenticated`, `isLoading`.
- При входе API возвращает `accessToken`; фронт кладёт его в `localStorage`.
- Refresh выполняется через `/api/auth/refresh` с `withCredentials: true`, поэтому refresh-сессия зависит от cookie API-домена.
- Корневой `/` делает server-side redirect через [app/page.tsx](app/page.tsx): серверный клиент пробует refresh по cookie и ведёт на `/dashboard` или `/login`.
- Защищённый `(main)` layout пока остаётся client-side gate, потому что рабочий access token хранится в браузере.

### API layer

- [lib/api/config.ts](lib/api/config.ts) — общие URL, JSON headers и сериализация query params.
- [lib/api/browser-client.ts](lib/api/browser-client.ts) — browser-only axios client: добавляет `Authorization` из `localStorage`, обновляет access token на 401, шлёт событие `auth:expired`.
- [lib/api/server-client.ts](lib/api/server-client.ts) — server-only axios client для Server Components, route handlers и server redirects; пробрасывает cookies из `next/headers`.
- [lib/api/client.ts](lib/api/client.ts) — совместимый shim на browser client. В новом коде лучше импортировать явно `browser-client` или `server-client`.
- Ресурсные модули (`activs.ts`, `users.ts`, `orgs.ts` и т.д.) сейчас используются клиентскими страницами и импортируют browser client.

### SWR cache keys

- Общий хук [lib/hooks/use-api.ts](lib/hooks/use-api.ts) принимает `key`, `fetcher` и опции SWR.
- Для списков и сущностей ключ должен включать endpoint и все фильтры/параметры, которые меняют результат.
- Если запрос временно выключен, передавай `null` вместо key, чтобы SWR не делал network request.
- После мутаций используй `mutate`, чтобы обновить связанные ключи без полной перезагрузки страницы.

### Role model

- Роли берутся из `user.policies`, который приходит из `/api/users/me`.
- [lib/hooks/use-roles.ts](lib/hooks/use-roles.ts) вычисляет `isAdmin`, `isDirector`, `isManager`, `isRepresentative`.
- Отдельного `use-is-admin.ts` нет; для проверки прав используй `useRoles()`.
- UI-гейты на страницах скрывают недоступные действия, но backend всё равно остаётся источником истины для прав.

---

## Частые проблемы

### `Failed to fetch` / CORS

Неверный `NEXT_PUBLIC_API_URL` или на бэке не настроен CORS для `http://localhost:3000`.
Проверь значение в `.env.local` и перезапусти `npm run dev`.

### Запросы идут на старый URL после смены `.env.local`

Dev-сервер не перечитал переменные — перезапусти `npm run dev`. Для `build` — пересобери.

### 401 на каждый запрос после входа

Refresh-сессия протухла или запись в `localStorage` повреждена. Очисти `accessToken`, при необходимости cookie API-домена, и войди заново.

### Leaflet: серые тайлы / карта не грузится

Блокировка `tile.openstreetmap.org` (сеть, AdBlock) или CSP. Проверь вкладку Network.

### `Module not found` после pull

Зависимости разошлись с lock-файлом:

```bash
npm ci
```

Если менялся `package.json` — `npm install`.

### Tailwind-классы не применяются

Перезапусти dev-сервер. Убедись, что файл попадает в `content`-сканер Tailwind (по умолчанию — `app/`, `components/`).

### Порт 3000 занят

```bash
PORT=3001 npm run dev
```

или останови процесс, занявший порт.

### Ошибка сборки из-за ESLint

`npm run lint` локально, fix предупреждения. Отключать правило через `eslint-disable` — только осознанно.
