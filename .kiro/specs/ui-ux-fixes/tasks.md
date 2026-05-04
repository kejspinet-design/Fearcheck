# План реализации UI/UX исправлений

- [x] 1. Написать тесты для проверки Bug Condition (исследование багов)
  - **Property 1: Bug Condition** - UI/UX Issues Verification
  - **КРИТИЧЕСКИ ВАЖНО**: Эти тесты ДОЛЖНЫ ПРОВАЛИТЬСЯ на неисправленном коде - провал подтверждает наличие багов
  - **НЕ ПЫТАЙТЕСЬ исправить тесты или код когда они провалятся**
  - **ПРИМЕЧАНИЕ**: Эти тесты кодируют ожидаемое поведение - они будут валидировать исправления когда пройдут после реализации
  - **ЦЕЛЬ**: Выявить конкретные примеры, демонстрирующие существование багов
  - **Подход Scoped PBT**: Для детерминированных багов ограничить property конкретными проваливающимися случаями для воспроизводимости
  - Тестировать реализацию деталей из Bug Condition в design.md
  - Утверждения тестов должны соответствовать Expected Behavior Properties из design.md
  - Запустить тесты на НЕИСПРАВЛЕННОМ коде
  - **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ**: Тесты ПРОВАЛЯТСЯ (это правильно - доказывает существование багов)
  - Задокументировать найденные контрпримеры для понимания первопричины
  - Отметить задачу выполненной когда тесты написаны, запущены и провалы задокументированы
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13_

  **Тестовые сценарии для проверки:**
  
  1.1 **Auto-scroll Test**: Кликнуть на "Снятие выговоров" в rules.html
     - Ожидается: Страница НЕ прокручивается наверх (баг на неисправленном коде)
     - Контрпример: Клик не вызывает `window.scrollTo({ top: 0, behavior: 'smooth' })`
  
  1.2 **Header Text Color Test**: Загрузить любую страницу и проверить цвет текста "Fear Protection"
     - Ожидается: Текст отображается с градиентом вместо белого цвета (баг на неисправленном коде)
     - Контрпример: `.logo-text` имеет `background: linear-gradient(...)` вместо `color: white`
  
  1.3 **Header Alignment Test**: Загрузить любую страницу и проверить выравнивание логотипа
     - Ожидается: Логотип и текст по центру вместо слева (баг на неисправленном коде)
     - Контрпример: `.header-content` имеет `justify-content: center` вместо `flex-start`
  
  1.4 **Section Text Color Test**: Просмотреть секции в rules.html
     - Ожидается: Текст секций не белого цвета (баг на неисправленном коде)
     - Контрпример: `.section-title`, `.rule-text` не имеют `color: white`
  
  1.5 **Section Border Color Test**: Просмотреть границы секций в rules.html
     - Ожидается: Границы секций не белого цвета (баг на неисправленном коде)
     - Контрпример: `.rules-section` не имеет `border-color: white`
  
  1.6 **Category Border Color Test**: Просмотреть разные категории правил
     - Ожидается: Все категории имеют одинаковый цвет границы (баг на неисправленном коде)
     - Контрпример: Правила наказаний не имеют желтую границу (`border-left-color: #fbbf24`)
  
  1.7 **Horizontal Overflow Test**: Изменить размер окна браузера
     - Ожидается: Появляется горизонтальная прокрутка (баг на неисправленном коде)
     - Контрпример: `body` не имеет `overflow-x: hidden`
  
  1.8 **Content Overflow Test**: Проверить выход контента за границы контейнера
     - Ожидается: Контент выходит за пределы `.container` (баг на неисправленном коде)
     - Контрпример: Контейнер не имеет `max-width: 100vw`
  
  1.9 **Punishment Text Weight Test**: Просмотреть текст наказаний в правилах
     - Ожидается: Текст наказаний жирный (баг на неисправленном коде)
     - Контрпример: `.rule-punishment` имеет `font-weight: bold` или `700`
  
  1.10 **Custom Scrollbar Test**: Прокрутить любую страницу
     - Ожидается: Отображается стандартный скроллбар браузера (баг на неисправленном коде)
     - Контрпример: Отсутствуют стили `::-webkit-scrollbar` для `body`
  
  1.11 **Easter Egg Text Position Test**: Активировать пасхалку
     - Ожидается: Текст "Поздравляю" накладывается на изображение (баг на неисправленном коде)
     - Контрпример: `.easter-egg-text` не имеет `margin-top` для отступа от изображения
  
  1.12 **Easter Egg Modal Display Test**: Активировать пасхалку на разных страницах
     - Ожидается: Модальное окно может не отображаться корректно (баг на неисправленном коде)
     - Контрпример: z-index или другие стили могут конфликтовать
  
  1.13 **Tracking Card Design Test**: Просмотреть карточки в tracking.html
     - Ожидается: Карточки имеют неоптимальный дизайн (баг на неисправленном коде)
     - Контрпример: Недостаточные отступы, отсутствие hover эффектов, слабая визуальная иерархия

- [x] 2. Написать preservation property тесты (ДО реализации исправлений)
  - **Property 2: Preservation** - Non-Buggy Functionality Preservation
  - **ВАЖНО**: Следовать методологии observation-first
  - Наблюдать поведение на НЕИСПРАВЛЕННОМ коде для не-багованных входных данных
  - Написать property-based тесты, фиксирующие наблюдаемые паттерны поведения из Preservation Requirements
  - Property-based тестирование генерирует множество тестовых случаев для более сильных гарантий
  - Запустить тесты на НЕИСПРАВЛЕННОМ коде
  - **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ**: Тесты ПРОХОДЯТ (это подтверждает базовое поведение для сохранения)
  - Отметить задачу выполненной когда тесты написаны, запущены и проходят на неисправленном коде
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  **Тестовые сценарии для сохранения:**
  
  2.1 **Navigation Transitions Preservation**: Проверить плавные переходы навигации
     - Наблюдать: Hover эффекты на навигационных элементах работают на неисправленном коде
     - Property: Для всех навигационных элементов hover состояния должны сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.2 **Subsection Scroll Preservation**: Проверить прокрутку к подсекциям
     - Наблюдать: Клик на подсекцию в rules.html прокручивает к ней на неисправленном коде
     - Property: Для всех подсекций прокрутка должна работать корректно
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.3 **Animated Backgrounds Preservation**: Проверить анимированные фоны
     - Наблюдать: Плавающие точки и красное свечение отображаются на неисправленном коде
     - Property: Для всех страниц анимации фона должны сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.4 **Glass-morphism Effects Preservation**: Проверить эффекты стекла на карточках
     - Наблюдать: Backdrop blur и прозрачность работают на неисправленном коде
     - Property: Для всех карточек glass-morphism эффекты должны сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.5 **Tracking Functionality Preservation**: Проверить функциональность отслеживания
     - Наблюдать: Добавление/удаление игроков работает на неисправленном коде
     - Property: Для всех операций с отслеживанием функциональность должна сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.6 **Statistics Display Preservation**: Проверить отображение статистики
     - Наблюдать: Kills, deaths, K/D, online status отображаются на неисправленном коде
     - Property: Для всех игроков статистика должна отображаться корректно
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.7 **Easter Egg Audio Preservation**: Проверить аудио пасхалки
     - Наблюдать: Аудио и GIF анимация работают на неисправленном коде
     - Property: При активации пасхалки аудио и анимация должны сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.8 **Rule Structure Preservation**: Проверить структуру правил
     - Наблюдать: Номера правил, текст, информация о наказаниях отображаются на неисправленном коде
     - Property: Для всех правил структура должна сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.9 **Hover States Preservation**: Проверить hover состояния
     - Наблюдать: Hover анимации на интерактивных элементах работают на неисправленном коде
     - Property: Для всех интерактивных элементов hover состояния должны сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ
  
  2.10 **Responsive Layout Preservation**: Проверить адаптивные макеты
     - Наблюдать: Мобильные макеты работают корректно на неисправленном коде
     - Property: Для всех размеров экрана адаптивность должна сохраняться
     - Запустить на НЕИСПРАВЛЕННОМ коде → Ожидается: ПРОХОДИТ

- [x] 3. Исправления UI/UX багов

  - [x] 3.1 Исправить auto-scroll в RulesPage.js
    - Открыть файл `js/RulesPage.js`
    - Найти функцию `setupNavigation()`
    - Добавить логику прокрутки наверх при клике на секцию "Снятие выговоров"
    - Вставить `window.scrollTo({ top: 0, behavior: 'smooth' })` после логики переключения секций
    - Убедиться что код выполняется специфично для секции warnings
    - _Bug_Condition: isBugCondition(input) где input.page == 'rules.html' AND input.action == 'click_warnings_section' AND NOT pageScrollsToTop()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectScrollBehavior(result) == true_
    - _Preservation: Navigation smooth transitions и hover effects должны продолжать работать (Requirements 3.1, 3.2)_
    - _Requirements: 1.1, 2.1_

  - [x] 3.2 Исправить стили заголовка в base.css
    - Открыть файл `css/base.css`
    - Изменить `.header-content` на `justify-content: flex-start` вместо `center`
    - Изменить `.logo-text` на `color: white` вместо gradient background-clip
    - Убедиться что `.logo-container` позиционируется слева
    - _Bug_Condition: isBugCondition(input) где headerTextHasGradient() OR headerLogoNotLeftAligned()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectStyling(result) == true_
    - _Preservation: Animated backgrounds и glass-morphism effects должны продолжать работать (Requirements 3.3, 3.4)_
    - _Requirements: 1.2, 1.3, 2.2, 2.3_

  - [x] 3.3 Добавить кастомные стили скроллбара в base.css
    - Открыть файл `css/base.css`
    - Добавить правила `::-webkit-scrollbar` для `body` и `html`
    - Установить ширину скроллбара, цвет трека (темный), цвет ползунка (красная тема)
    - Добавить hover состояние для ползунка
    - _Bug_Condition: isBugCondition(input) где scrollbarIsDefault()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectStyling(result) == true_
    - _Preservation: Hover states и animations должны продолжать работать (Requirements 3.9)_
    - _Requirements: 1.10, 2.10_

  - [x] 3.4 Исправить overflow контента в base.css
    - Открыть файл `css/base.css`
    - Установить `overflow-x: hidden` на `body` и `.container`
    - Убедиться что `max-width: 100vw` установлен на элементах контейнера
    - _Bug_Condition: isBugCondition(input) где hasHorizontalScroll() OR contentExtendsOutsideContainer()_
    - _Expected_Behavior: expectedBehavior(result) где hasNoLayoutOverflow(result) == true_
    - _Preservation: Responsive layouts должны продолжать работать (Requirements 3.10)_
    - _Requirements: 1.7, 1.8, 2.7, 2.8_

  - [x] 3.5 Исправить цвета текста и границ секций в rules.css
    - Открыть файл `css/rules.css`
    - Изменить `.section-title`, `.subsection-title`, `.rule-text` на `color: white` или `color: rgba(255, 255, 255, 0.9)`
    - Изменить `.rules-section`, `.section-title` border colors на white или `rgba(255, 255, 255, 0.3)`
    - _Bug_Condition: isBugCondition(input) где sectionTextNotWhite() OR sectionBordersNotWhite()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectStyling(result) == true_
    - _Preservation: Rule structure должна продолжать отображаться корректно (Requirements 3.8)_
    - _Requirements: 1.4, 1.5, 2.4, 2.5_

  - [x] 3.6 Добавить цвета границ для категорий правил в rules.css
    - Открыть файл `css/rules.css`
    - Добавить CSS классы или data атрибуты для разных категорий правил
    - Определить border-left colors: желтый для правил наказаний, другие цвета для других категорий
    - Пример: `.rule-item[data-category="punishment"]` с `border-left-color: #fbbf24`
    - _Bug_Condition: isBugCondition(input) где ruleCategoriesHaveSameBorderColor()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectStyling(result) == true_
    - _Preservation: Rule structure должна продолжать отображаться корректно (Requirements 3.8)_
    - _Requirements: 1.6, 2.6_

  - [x] 3.7 Исправить font-weight текста наказаний в rules.css
    - Открыть файл `css/rules.css`
    - Изменить `.rule-punishment` на `font-weight: normal` или `font-weight: 400`
    - Если используется тег `strong`, переопределить с `.rule-punishment strong { font-weight: 400; }`
    - _Bug_Condition: isBugCondition(input) где punishmentTextIsBold()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectStyling(result) == true_
    - _Preservation: Rule structure должна продолжать отображаться корректно (Requirements 3.8)_
    - _Requirements: 1.9, 2.9_

  - [x] 3.8 Исправить позицию текста пасхалки в easter-egg.css
    - Открыть файл `css/easter-egg.css`
    - Изменить `.easter-egg-content` для обеспечения правильного flex-direction и spacing
    - Добавить `margin-top` к `.easter-egg-text` для создания пространства под изображением
    - Убедиться что `.easter-egg-gif` имеет `margin-bottom` для разделения
    - _Bug_Condition: isBugCondition(input) где textOverlaysImage()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectEasterEggDisplay(result) == true_
    - _Preservation: Easter egg audio и GIF animation должны продолжать работать (Requirements 3.7)_
    - _Requirements: 1.11, 2.11_

  - [x] 3.9 Исправить отображение модального окна пасхалки в easter-egg.css
    - Открыть файл `css/easter-egg.css`
    - Проверить что z-index достаточно высокий (уже 10000)
    - Убедиться что модальное окно не скрыто другими элементами
    - _Bug_Condition: isBugCondition(input) где modalNotDisplayedCorrectly()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectEasterEggDisplay(result) == true_
    - _Preservation: Easter egg audio и GIF animation должны продолжать работать (Requirements 3.7)_
    - _Requirements: 1.12, 2.12_

  - [x] 3.10 Улучшить дизайн карточек отслеживания в tracking.html
    - Открыть файл `tracking.html` или создать `css/tracking.css`
    - Увеличить padding карточек для лучшего spacing
    - Добавить тонкий box-shadow для глубины
    - Улучшить цветовой контраст для текстовых элементов
    - Добавить hover эффекты с transform и shadow
    - Улучшить стилизацию границ с gradient или glow эффектом
    - Улучшить визуальную иерархию stat-box с лучшей типографикой
    - _Bug_Condition: isBugCondition(input) где input.page == 'tracking.html' AND cardsHaveSuboptimalDesign()_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectStyling(result) == true_
    - _Preservation: Tracking functionality и statistics display должны продолжать работать (Requirements 3.5, 3.6)_
    - _Requirements: 1.13, 2.13_

  - [x] 3.11 Удалить inline стили переопределяющие base.css
    - Открыть файлы `rules.html`, `tracking.html`, `anticheat.html`, `check.html`
    - Удалить inline стили из `.header`, `.header-content`, `.logo-container`, `.logo-text`
    - Позволить стилям base.css применяться естественно
    - _Bug_Condition: isBugCondition(input) где hasIncorrectStyling(input)_
    - _Expected_Behavior: expectedBehavior(result) где hasCorrectStyling(result) == true_
    - _Preservation: Все существующие функциональности должны продолжать работать_
    - _Requirements: 1.2, 1.3, 2.2, 2.3_

  - [x] 3.12 Проверить что bug condition exploration тест теперь проходит
    - **Property 1: Expected Behavior** - UI/UX Issues Fixed
    - **ВАЖНО**: Перезапустить ТОТ ЖЕ тест из задачи 1 - НЕ писать новый тест
    - Тест из задачи 1 кодирует ожидаемое поведение
    - Когда этот тест проходит, это подтверждает что ожидаемое поведение удовлетворено
    - Запустить bug condition exploration тест из шага 1
    - **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ**: Тест ПРОХОДИТ (подтверждает что баги исправлены)
    - _Requirements: Expected Behavior Properties из design.md (2.1-2.13)_

  - [x] 3.13 Проверить что preservation тесты все еще проходят
    - **Property 2: Preservation** - Non-Buggy Functionality Preserved
    - **ВАЖНО**: Перезапустить ТЕ ЖЕ тесты из задачи 2 - НЕ писать новые тесты
    - Запустить preservation property тесты из шага 2
    - **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ**: Тесты ПРОХОДЯТ (подтверждает отсутствие регрессий)
    - Подтвердить что все тесты все еще проходят после исправлений (нет регрессий)

- [x] 4. Checkpoint - Убедиться что все тесты проходят
  - Убедиться что все тесты проходят, задать вопросы пользователю если возникнут
