module.exports = class Cache {
    constructor(clean_up_interval) {
        this.cache = {};
        this.clean_up_interval = clean_up_interval;
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
        let x = this.cache[key];
        x.ttl = Date.now() + this.clean_up_interval;
        return x.value;
    }

    set(key, value, ttl) {
        this.cache[key] = { value, ttl: Date.now() + ttl };
    }

    exists(key) {
        return this.cache[key] !== undefined;
    }

    del(key) {
        delete this.cache[key];
    }
}