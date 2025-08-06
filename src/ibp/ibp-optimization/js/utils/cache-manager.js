class CacheManager {
    constructor(maxSize = 100, ttl = 300000) { // 5 minutes default TTL
        this.cache = new Map();
        this.timestamps = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl; // Time to live in milliseconds
        this.hits = 0;
        this.misses = 0;
    }

    set(key, value, customTTL = null) {
        // Check if cache is full
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictOldest();
        }

        this.cache.set(key, value);
        this.timestamps.set(key, {
            created: Date.now(),
            ttl: customTTL || this.ttl
        });
    }

    get(key) {
        if (!this.cache.has(key)) {
            this.misses++;
            return null;
        }

        const timestamp = this.timestamps.get(key);
        const age = Date.now() - timestamp.created;

        // Check if expired
        if (age > timestamp.ttl) {
            this.cache.delete(key);
            this.timestamps.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return this.cache.get(key);
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
    }

    clear() {
        this.cache.clear();
        this.timestamps.clear();
        this.hits = 0;
        this.misses = 0;
    }

    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, timestamp] of this.timestamps) {
            if (timestamp.created < oldestTime) {
                oldestTime = timestamp.created;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }

    // Create hash key for complex objects
    createKey(...args) {
        return args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join('|');
    }
}

if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
}