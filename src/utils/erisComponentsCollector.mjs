/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import EventEmitter from 'events';

export default class ErisComponentsCollector extends EventEmitter {
    constructor(ErisClient, filter, channel, options) {
        super();
        this.collections = [];
        this.endedBool = false;

        const maxListeners = ErisClient.getMaxListeners();
        if (maxListeners !== 0) ErisClient.setMaxListeners(maxListeners + 1);

        const listenerFN = async (data) => {
            if (!data.data.componentType) return;
            if (data.channelID != channel) return;

            if (await filter.call(null, data)) {
                this.collections.push(data);
                this.emit('collect', data);
            }
        };

        ErisClient.on('componentInteract', listenerFN);

        if (options && options.time && options.time > 0) {
            new Promise((resolve) => setTimeout(resolve, options.time))
            .then(() => this.emit('preEnd', true));
        }

        this.on('preEnd', () => {
            this.endedBool = true;

            ErisClient.removeListener('componentInteract', listenerFN);

            const newMaxListeners = ErisClient.getMaxListeners();
            if (newMaxListeners !== 0) ErisClient.setMaxListeners(newMaxListeners - 1);

            this.emit('end', this.collections);
        });
    }

    get ended() {
        return this.endedBool;
    }

    get collected() {
        return this.collections;
    }

    stop() {
        this.emit('preEnd', true);
        return true;
    }
}
