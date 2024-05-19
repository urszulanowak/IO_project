class Cache {
    constructor(clean_up_interval) {
        this.cache = {};
        this.cleaner = setInterval(() => {
            const now = Date.now();
            for (const key in this.cache) {
                if (this.cache[key].ttl < now) {
                    delete this.cache[key];
                }
            }
        }, clean_up_interval * 1000);
    }

    get(key) {
        return this.cache[key];
    }

    set(key, value, ttl = 3600) {
        this.cache[key] = { value, ttl: Date.now() + ttl * 1000 };
    }

    del(key) {
        delete this.cache[key];
    }
}