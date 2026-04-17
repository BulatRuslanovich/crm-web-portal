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

## 2. Поднять бэкенд

Портал без бэка работать не будет. Варианта два:

**В Docker (рекомендуется):**

```bash
cd ../CrmWebApi
docker compose up -d
```

**Через `dotnet run`:** см. [../CrmWebApi/DEV.md](../CrmWebApi/DEV.md).

В обоих случаях API поднимется на `http://localhost:5000`.

---

## 3. Настроить переменные окружения

Создай файл `.env.local` в корне (не коммитится):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Единственная переменная портала — `NEXT_PUBLIC_API_URL` ([lib/api/client.ts:5](lib/api/client.ts#L5)).

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

Зарегистрируйся / войди. Токены сохранятся в `localStorage` (`accessToken`, `refreshToken`). Axios-interceptor ([lib/api/client.ts](lib/api/client.ts)) автоматически обновит токен на 401.

**Ручной сброс сессии:** DevTools → Application → Local Storage → удалить `accessToken` и `refreshToken`.

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

| Инструмент | Конфиг |
|---|---|
| ESLint | [eslint.config.mjs](eslint.config.mjs) (flat config, `eslint-config-next`) |
| Prettier | [prettier.config.mjs](prettier.config.mjs) + `prettier-plugin-tailwindcss` |
| EditorConfig | [.editorconfig](.editorconfig) |

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
│   ├── use-api.ts      — хук запросов к API
│   ├── use-entity.ts   — хук CRUD-операций
│   ├── use-set-diff.ts — хук отслеживания изменений набора
│   ├── use-roles.ts    — роли текущего пользователя
│   ├── use-is-admin.ts — проверка прав админа
│   └── format.ts       — форматирование дат/значений
├── next.config.ts      — React Compiler, standalone output
└── Dockerfile          — multi-stage сборка
```

---

## Частые проблемы

### `Failed to fetch` / CORS

Неверный `NEXT_PUBLIC_API_URL` или на бэке не настроен CORS для `http://localhost:3000`.
Проверь значение в `.env.local` и перезапусти `npm run dev`.

### Запросы идут на старый URL после смены `.env.local`

Dev-сервер не перечитал переменные — перезапусти `npm run dev`. Для `build` — пересобери.

### 401 на каждый запрос после входа

Refresh-токен протух или запись в `localStorage` повреждена. Очисти `accessToken` / `refreshToken` и войди заново.

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
