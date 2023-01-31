/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import redis from '../utils/redis.mjs'
import {getMode} from 'gamemodeconverion'

export default async (packet, sharder)=>{
    const channel = sharder.getChannel(packet.channel_id);
    if (!channel?.messages) return;
    
    const message = channel?.messages?.get(packet.id);

    if (message.author?.bot || channel.type !== 0 || message.embeds?.length !== 0 || message.attachments?.size !== 0 || message.content === Infinity || message.content === null || isNaN(message.content)) return;
    if (await redis.getdel(message.id) === "1") return;

    const countChannel = (await pgPool`SELECT del_message, hook_enabled, last_num, difficulty FROM data INNER JOIN channelsettings ON data.channelid=channelsettings.channelid WHERE data.channelid = ${packet.channel_id}`)[0];
    if (!countChannel?.del_message || countChannel?.hook_enabled || countChannel?.nofail) return;

    const {fromDecimal, diffrence} = getMode(countChannel.difficulty)
    
    sharder.rest.channels.createMessage(packet.channel_id, {"embeds": [{"title": `Number ${fromDecimal(message.content)} sent by ${message.author.username} has been deleted. The next number is: ${fromDecimal((countChannel.last_num+diffrence).toFixed(2))}`,"color": 14680145}]}).catch(()=>{});
}