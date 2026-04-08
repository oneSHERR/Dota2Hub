# Dota 2 Hub

Dota 2 Draft Arena, Wiki героев, Квизы и Патчноуты — всё в одном месте.

## Фичи

- **Draft Arena** — мультиплеер 1v1 через Firebase. Выбирай героев по позициям, AI анализирует связки, линии и матчапы
- **Wiki героев** — все 127 героев с контрпиками, синергиями и матчапами
- **Квизы** — определи свою позицию и подбери идеального героя
- **Патч 7.41b** — полные изменения героев и предметов на русском
- **Профиль** — регистрация, статистика побед, друзья, история матчей

## Стек

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Firebase (Auth + Realtime Database)

## Быстрый старт

```bash
npm install
npm run dev
```

## Настройка Firebase

1. [console.firebase.google.com](https://console.firebase.google.com) → проект `dotadraftarena`
2. **Authentication** → Sign-in method → включи **Email/Password**
3. **Realtime Database** → Rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Деплой на GitHub Pages

1. Измени `base` в `vite.config.ts` на `/имя-твоего-репо/`
2. Push в `main` — деплой автоматический через GitHub Actions
3. Settings → Pages → Source: **GitHub Actions**

## Лицензия  

MIT
