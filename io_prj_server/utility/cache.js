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

    set(key, value, ttl) {
        this.cache[key] = { value, ttl: Date.now() + ttl };
    }

    del(key) {
        delete this.cache[key];
    }
}