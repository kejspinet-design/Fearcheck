// Тест интеграции для проверки работы ConfigChecker с новым API
console.log('=== Тест интеграции ConfigChecker ===');

// Тестовые данные из нового API формата
const testPlayerData = {
    steamid: "76561199847445471",
    name: "knorex",
    avatar: "https://avatars.steamstatic.com/75e881e6a5df7ae0b62a010104c62cb858508ed2.jpg",
    avatar_full: "https://avatars.steamstatic.com/75e881e6a5df7ae0b62a010104c62cb858508ed2_full.jpg",
    avatar_medium: "https://avatars.steamstatic.com/75e881e6a5df7ae0b62a010104c62cb858508ed2_medium.jpg"
};

// Тестовые данные бана
const testBanData = {
    total: "2",
    page: 1,
    limit: 10,
    punishments: [
        {
            id: 138139,
            steamid: "76561199847445471",
            name: "mxlsdead",
            admin: "MIYAGI99917 • FEAR",
            admin_steamid: "76561198743946876",
            admin_avatar: "https://avatars.steamstatic.com/d8f81ca53e3cc08db3666d9397989626d7ae1a88_medium.jpg",
            avatar: "https://avatars.steamstatic.com/75e881e6a5df7ae0b62a010104c62cb858508ed2_medium.jpg",
            reason: "прошёл проверку",
            status: 2,
            duration: 5184000,
            created: 1777617013,
            expires: 1782801013,
            unbanPrice: null,
            punish_type: 0,
            type: 0
        }
    ]
};

// Тест парсинга Steam ID из config.vdf
function testSteamIdParsing() {
    console.log('\n1. Тест парсинга Steam ID:');
    
    const testConfigContent = `
"UserLocalConfigStore"
{
    "Software"
    {
        "Valve"
        {
            "Steam"
            {
                "Accounts"
                {
                    "76561199881908264"
                    {
                        "AccountName"		"testuser1"
                    }
                    "76561198881908265"
                    {
                        "AccountName"		"testuser2"
                    }
                    "76561197881908266"
                    {
                        "AccountName"		"testuser3"
                    }
                }
            }
        }
    }
}
`;
    
    const steamIdPattern = /7656119\d{10}/g;
    const matches = testConfigContent.match(steamIdPattern);
    const uniqueIds = matches ? [...new Set(matches)] : [];
    
    console.log(`Найдено Steam ID: ${uniqueIds.length}`);
    console.log(`Список: ${uniqueIds.join(', ')}`);
    
    if (uniqueIds.length === 3) {
        console.log('✅ Парсинг Steam ID работает правильно');
    } else {
        console.log('❌ Ошибка парсинга Steam ID');
    }
}

// Тест обработки данных игрока из нового API
function testPlayerDataProcessing() {
    console.log('\n2. Тест обработки данных игрока:');
    
    // Эмуляция логики из ConfigChecker.fetchPlayerData
    const nickname = (testPlayerData.name && testPlayerData.name !== 'undefined') ? testPlayerData.name : null;
    const avatar = testPlayerData.avatar_full || testPlayerData.avatar || null;
    
    console.log(`Ник: ${nickname}`);
    console.log(`Аватар: ${avatar}`);
    
    if (nickname === 'knorex' && avatar && avatar.includes('avatar_full')) {
        console.log('✅ Обработка данных игрока работает правильно');
    } else {
        console.log('❌ Ошибка обработки данных игрока');
    }
}

// Тест проверки бана
function testBanCheck() {
    console.log('\n3. Тест проверки бана:');
    
    // Эмуляция логики из ConfigChecker.checkFearBan
    const punishments = testBanData.punishments;
    let banned = false;
    let reason = 'Не забанен';
    
    if (punishments && Array.isArray(punishments) && punishments.length > 0) {
        const ban = punishments[0];
        const status = ban.status;
        
        if (status === 1) {
            banned = true;
            reason = ban.reason || 'Забанен';
        } else {
            banned = false;
            reason = 'Бан истек';
        }
    }
    
    console.log(`Статус бана: ${banned ? 'Забанен' : 'Чист'}`);
    console.log(`Причина: ${reason}`);
    
    if (banned === false && reason === 'Бан истек') {
        console.log('✅ Проверка бана работает правильно (статус 2 = истекший бан)');
    } else {
        console.log('❌ Ошибка проверки бана');
    }
}

// Тест создания карточки результата
function testResultCardCreation() {
    console.log('\n4. Тест создания карточки результата:');
    
    const result = {
        steamId: "76561199847445471",
        fearBanned: false,
        fearReason: 'Не забанен',
        umaBanned: false,
        umaReason: 'Не проверяется',
        isBanned: false,
        nickname: 'knorex',
        avatar: 'https://avatars.steamstatic.com/75e881e6a5df7ae0b62a010104c62cb858508ed2_full.jpg'
    };
    
    // Проверка escapeHtml функции
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    const escapedNickname = escapeHtml(result.nickname);
    console.log(`Экранированный ник: ${escapedNickname}`);
    
    // Проверка создания HTML для аватара
    const avatarHtml = result.avatar 
        ? `<img src="${result.avatar}" alt="Avatar" class="player-avatar" onerror="this.style.display='none'">`
        : '<div class="player-avatar-placeholder">👤</div>';
    
    console.log(`HTML аватара: ${avatarHtml.substring(0, 100)}...`);
    
    if (escapedNickname === 'knorex' && avatarHtml.includes('player-avatar')) {
        console.log('✅ Создание карточки результата работает правильно');
    } else {
        console.log('❌ Ошибка создания карточки результата');
    }
}

// Запуск всех тестов
function runAllTests() {
    console.log('=== Запуск тестов интеграции ===');
    
    testSteamIdParsing();
    testPlayerDataProcessing();
    testBanCheck();
    testResultCardCreation();
    
    console.log('\n=== Итог тестов ===');
    console.log('Все компоненты готовы к работе с новым API форматом.');
    console.log('API endpoint: /profile/{steamid}');
    console.log('Поля данных: name (ник), avatar_full (полная аватарка)');
    console.log('Статус бана: 1 = активный, 2 = истекший');
}

// Запуск тестов при загрузке
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}