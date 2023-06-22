/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
export default class redisCache{
    #redis
    #prefix
    constructor(options){
        this.#redis = options.redis;
        this.#prefix = options.prefix
    }

    async get(key){
       const redisData = await this.#redis.get(`${this.#prefix}:${key}`);
        try {
            return JSON.parse(redisData)
        } catch (e) {
            return redisData
        }
    }

    set(key, value, expiry){
        if (expiry) this.#redis.set(`${this.#prefix}:${key}`, typeof value === "object" ? JSON.stringify(value) : value, "EX", expiry)
        else this.#redis.set(`${this.#prefix}:${key}`, typeof value === "object" ? JSON.stringify(value) : value)
    }
    
    delete(key){
        this.#redis.del(`${this.#prefix}:${key}`)
    }

    async has (key){
        return this.#redis.exists(`${this.#prefix}:${key}`)
    }
}