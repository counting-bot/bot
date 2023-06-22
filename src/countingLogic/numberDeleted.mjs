/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import {getMode} from 'gamemodeconverion'

export default async (packet, sharder)=>{
    const message = JSON.parse(await sharder.redis.getdel(`messageCache:${packet.id}`))
    if (!message) return;
    
    if (await sharder.redis.getdel(`selfDel:${packet.id}`) === "1") return;

    const countChannel = (await pgPool`SELECT del_message, hook_enabled, last_num, difficulty FROM data INNER JOIN channelsettings ON data.channelid=channelsettings.channelid WHERE data.channelid = ${packet.channel_id}`)[0];
    if (!countChannel?.del_message || countChannel?.hook_enabled || countChannel?.nofail) return;

    const {fromDecimal, diffrence} = getMode(countChannel.difficulty)

    const user = await sharder.counterCache.get(message.author_id)
    
    sharder.rest.channels.createMessage(packet.channel_id, {"embeds": [{"title": `Number ${fromDecimal(message.content)} sent by ${user.display_name ?? user.username} has been deleted. The next number is: ${fromDecimal((countChannel.last_num+diffrence).toFixed(2))}`,"color": 14680145}]}).catch(()=>{});
}