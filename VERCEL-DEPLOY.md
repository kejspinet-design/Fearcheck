# 🚀 Деплой на Vercel

Ваш репозиторий: https://github.com/kejspinet-design/Fearcheck.git

## Способ 1: Через Vercel Dashboard (Рекомендуется)

### Шаги:

1. **Зайдите на Vercel**
   - Откройте https://vercel.com
   - Войдите через GitHub аккаунт

2. **Создайте новый проект**
   - Нажмите "Add New..." → "Project"
   - Или нажмите "Import Project"

3. **Импортируйте репозиторий**
   - Найдите репозиторий `kejspinet-design/Fearcheck`
   - Нажмите "Import"

4. **Настройте проект**
   - **Project Name**: `fearcheck` (или любое другое имя)
   - **Framework Preset**: Other (или оставьте пустым)
   - **Root Directory**: `.` (корень проекта)
   - **Build Command**: оставьте пустым
   - **Output Directory**: оставьте пустым

5. **Деплой**
   - Нажмите "Deploy"
   - Подождите 1-2 минуты
   - Готово! 🎉

6. **Ваш сайт будет доступен по адресу:**
   ```
   https://fearcheck.vercel.app
   ```
   или
   ```
   https://fearcheck-[random].vercel.app
   ```

---

## Способ 2: Через Vercel CLI

### Установка:
```bash
npm install -g vercel
```

### Вход:
```bash
vercel login
```

### Деплой:
```bash
cd check-page-standalone
vercel --prod
```

---

## После деплоя

### Проверьте:
1. Откройте ваш сайт
2. Проверьте консоль браузера (F12)
3. Попробуйте:
   - Загрузить config.vdf файл
   - Проверить Steam ID

### Если есть ошибки:
- Проверьте консоль браузера
- Убедитесь что все файлы загрузились
- Проверьте пути к файлам

---

## Автоматический деплой

После первого деплоя, каждый push в GitHub будет автоматически деплоить новую версию на Vercel!

```bash
# Внесите изменения
git add .
git commit -m "Update"
git push

# Vercel автоматически задеплоит изменения!
```

---

## Настройка домена (опционально)

1. Зайдите в настройки проекта на Vercel
2. Перейдите в "Domains"
3. Добавьте свой домен
4. Следуйте инструкциям Vercel

---

## Полезные ссылки

- Vercel Dashboard: https://vercel.com/dashboard
- Документация Vercel: https://vercel.com/docs
- Ваш репозиторий: https://github.com/kejspinet-design/Fearcheck

---

## Готово! 🎉

Ваша страница проверки теперь доступна онлайн!