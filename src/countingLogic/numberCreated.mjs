/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import countingLogic from './countingLogic.mjs'
import userStructure from '../structures/user.mjs'

export default async (packet, sharder)=>{
    if (packet.content === "" || packet.author?.bot || (packet.type !== 19 && packet.type !== 0) || (packet.sticker_items)) return;

    const guild = await sharder.guildCache.get(packet.guild_id)
    const channel = await sharder.channelCache.get(packet.channel_id);
    if (channel?.type !== 0) return;

    const countChannel = (await pgPool`SELECT * FROM data INNER JOIN channelsettings ON data.channelid=channelsettings.channelid WHERE data.channelid = ${packet.channel_id}`.catch(()=>{}))[0]
    if(!countChannel) return;
    if (await sharder.redis.exists(`failCoolDown:${packet.channel_id}`)) return sharder.rest.channels.createReaction(packet.channel_id, packet.id, "🚧").catch(()=>{});

    const newNumber = new countingLogic(packet, countChannel, sharder, channel.name, guild)
    
    await newNumber.convertMessage()
    if (!(Math.abs(Number(newNumber.value)) <= Number.MAX_SAFE_INTEGER)) return;

    sharder.redis.set(`messageCache:${packet.id}`, JSON.stringify({
        content: packet.content,
        channel_id: packet.channel_id,
        author_id: packet.author.id,
        guild_id: packet.guild_id
    }), "EX", 240)

    sharder.counterCache.set(packet.author.id, new userStructure(packet.author), 3600)

    const countUser = await pgPool`INSERT INTO users (username, userid) VALUES (${packet.author.display_name?? packet.author.username}, ${packet.author.id}) ON CONFLICT (userid) DO UPDATE SET username = ${packet.author.display_name?? packet.author.username} RETURNING isbanned, saves`.catch(()=>{})
    if (!countUser[0]) return;
    if (countUser[0].isbanned) return sharder.rest.channels.createReaction(packet.channel_id, packet.id, "⛔").catch(()=>{});
    newNumber.setCountUser(countUser[0])

    newNumber.failReason()

    if (countChannel.hook_enabled && countChannel.hook_id !=="" && countChannel.hook_token !=="" && newNumber.reason !== "noFailWrong") await newNumber.exucuteWebhook()
    
    newNumber.messageReactions()

    newNumber.updateLogs()
}