<div align="center">

# CRM Web Portal

**Веб-интерфейс фармацевтической CRM-системы**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

</div>

---

## О проекте

Фронтенд CRM для фарм компаний: дашборд, активности, организации, контакты, аналитика, карта и админ-панель. Работает в паре с [crm_api](https://github.com/BulatRuslanovich/crm_api).


## Стек технологий

| Категория | Технологии |
|---|---|
| Фреймворк | Next.js 16 (App Router, React Compiler) |
| UI | React 19, Radix UI |
| Язык | TypeScript 5 |
| Стилизация | Tailwind CSS 4 |
| Формы | React Hook Form |
| Данные | SWR, Axios |
| Анимации | Framer Motion |
| Графики | Recharts |
| Карты | Leaflet, React-Leaflet |
| Даты | date-fns, react-day-picker |
| Темы | next-themes |
| Линтинг | ESLint, Prettier |
| Инфраструктура | Docker, Node 20, Caddy |


Ключевые точки:

- **App Router** — файловая маршрутизация, route groups `(auth)` и `(main)`
- **React Compiler** — авто-мемоизация, включён в [next.config.ts](next.config.ts)
- **AuthContext** — глобальное состояние авторизации, JWT + auto-refresh через axios-interceptor
- **SWR** — кеш/ревалидация серверных данных
- **Standalone output** — минимальный Docker-образ

## Разделы приложения

| Раздел | Путь | Описание |
|---|---|---|
| Авторизация | [app/(auth)/](app/(auth)/) | логин, регистрация, OTP, сброс пароля |
| Дашборд | [app/(main)/dashboard/](app/(main)/dashboard/) | ключевые метрики |
| Активности | [app/(main)/activs/](app/(main)/activs/) | визиты и активности |
| Организации | [app/(main)/orgs/](app/(main)/orgs/) | справочник организаций |
| Контакты | [app/(main)/physes/](app/(main)/physes/) | справочник физлиц |
| Аналитика | [app/(main)/analytics/](app/(main)/analytics/) | графики |
| Отчёты | [app/(main)/reports/](app/(main)/reports/) | отчёты по активностям |
| Календарь | [app/(main)/calendar/](app/(main)/calendar/) | календарь активностей |
| Карта | [app/(main)/map/](app/(main)/map/) | карта организаций |
| Профиль | [app/(main)/profile/](app/(main)/profile/) | профиль пользователя |
| Админ | [app/(main)/admin/](app/(main)/admin/) | панель администратора |

## Запуск

**Локально:**

```bash
npm install
npm run dev
```

Откроется на [http://localhost:3000](http://localhost:3000). Подробности — в [DEV.md](DEV.md).

## Переменные окружения

| Переменная | Обязательна | По умолчанию | Описание |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | да | `http://localhost:5000` | URL бэкенда ([crm_api](https://github.com/BulatRuslanovich/crm_api)) |
| `NEXT_PUBLIC_SITE_URL` | да для production | `https://crmwebapi.ru` | Публичный URL портала для metadata, sitemap и robots |

`NEXT_PUBLIC_*` встраивается в бандл на этапе `npm run build` — пересборка обязательна при смене URL.

## Документация

- **[DEV.md](DEV.md)** — памятка разработчику: как поднять портал локально

