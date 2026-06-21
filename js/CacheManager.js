/**
 * CacheManager - управление кешированием API запросов
 * Автоматически инвалидирует данные по истечении TTL
 */
class CacheManager {
    constructor(ttl = 30000) { // TTL по умолчанию 30 секунд
        this.cache = new Map();
        this.ttl = ttl;
    }

    /**
     * Получить данные из кеша
     * @param {string} key - ключ кеша
     * @returns {any|null} - закешированные данные или null если не найдены/истекли
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // Проверяем, не истек ли TTL
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * Сохранить данные в кеш
     * @param {string} key - ключ кеша
     * @param {any} data - данные для сохранения
     */
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Очистить весь кеш
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Удалить конкретный ключ из кеша
     * @param {string} key - ключ для удаления
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Получить размер кеша
     * @returns {number} - количество элементов в кеше
     */
    size() {
        return this.cache.size;
    }
}
