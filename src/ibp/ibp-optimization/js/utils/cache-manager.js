// js/utils/cache-manager.js
// FIXED VERSION - Added memory usage estimation to getStats()

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

    // Estimate memory usage of cached items
    estimateMemoryUsage() {
        let totalSize = 0;
        
        for (const [key, value] of this.cache) {
            // Estimate key size
            totalSize += key.length * 2; // Approximate bytes for string
            
            // Estimate value size
            if (value === null || value === undefined) {
                totalSize += 4;
            } else if (typeof value === 'boolean') {
                totalSize += 4;
            } else if (typeof value === 'number') {
                totalSize += 8;
            } else if (typeof value === 'string') {
                totalSize += value.length * 2;
            } else if (typeof value === 'object') {
                // Rough estimation for objects
                try {
                    const jsonStr = JSON.stringify(value);
                    totalSize += jsonStr.length * 2;
                } catch (e) {
                    // If circular reference or other issue, estimate
                    totalSize += 1024; // Default 1KB per object
                }
            }
        }
        
        // Add overhead for Map structures
        totalSize += (this.cache.size + this.timestamps.size) * 32;
        
        return Math.round(totalSize / 1024); // Return in KB
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            size: this.cache.size,
            maxSize: this.maxSize,
            memoryUsage: this.estimateMemoryUsage(), // Memory usage in KB
            ttl: this.ttl
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

// Export for browser
if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
}

