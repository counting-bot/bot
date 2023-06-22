/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import { Client } from 'oceanic.js';
import redisCache from './utils/redisCache.mjs';
import packet from './events/packet.mjs';

import { Redis } from 'ioredis';
import { schedule } from 'node-cron';
import pgPool from './utils/db.mjs'

import commandList from './slashCommands/commandList.mjs';

const { token, clientID } = await import(process.env.NODE_ENV === "production" ? '/static/settings.mjs' : './static/settings.mjs');

const client = new Client({
    auth: token,
    collectionLimits: {
        messages: 0,
        members: 0,
        users: 0
    },
    gateway:{
        intents: [
            "GUILDS",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT"
        ],
        presence:{
            status: "idle",
            activities: [{
                name: "Booting up",
                type: 0,
            }]
        }
    }
})

client.redis = new Redis(6379, process.env.NODE_ENV === "production" ? "cache" : "192.168.0.21");

client.counterCache = new redisCache({redis: client.redis, prefix: "counterCache"})
client.guildCache = new redisCache({redis: client.redis, prefix: "guildCache"})
client.channelCache = new redisCache({redis: client.redis, prefix: "channelCache"})

client.on("ready", async()=>{
    if (!client.commands) {
        let discordCommands = await client.rest.applicationCommands.getGlobalCommands(clientID);
        if (discordCommands.length === 0) {
            remoteCommands = await client.rest.applicationCommands.bulkEditGlobalCommands(clientID, commandList)
        }

        client.commands = new Map(
            commandList.map(command => {
                return [command.name, {commandFile: command, discordInfo: discordCommands.find(discordCommand=>{return discordCommand.name === command.name})}]
            })
        )
    }

    client.editStatus("dnd", [{ name: "/help", type: 0}]);
})

client.on("error", error => console.log(error))
client.on("packet", packet.bind(null, client))
client.connect()

// monthly
schedule('0 0 1 * *', async () => {
    // reset  mothly channel lb
    pgPool`DELETE FROM mothlychannellb`.catch(err=>{});
})