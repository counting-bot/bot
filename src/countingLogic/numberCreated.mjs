/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import countingLogic from './countingLogic.mjs'

export default async (packet, sharder)=>{
    if (packet.author?.bot || (packet.type !== 19 && packet.type !== 0) || packet.attachments?.length !== 0 || (packet.sticker_items)) return;

    const channel = sharder.getChannel(packet.channel_id);
    if (channel.type !== 0) return;

    const countChannel = (await pgPool`SELECT * FROM data INNER JOIN channelsettings ON data.channelid=channelsettings.channelid WHERE data.channelid = ${packet.channel_id}`.catch(()=>{}))[0]
    if(!countChannel) return;

    const newNumber = new countingLogic(packet, countChannel, sharder, channel)

    await newNumber.convertMessage()
    if (!(Math.abs(Number(newNumber.value)) <= Number.MAX_SAFE_INTEGER)) return;

    const countUser = await pgPool`INSERT INTO users (username, userid) VALUES (${`${packet.author.username}#${packet.author.discriminator}`}, ${packet.author.id}) ON CONFLICT (userid) DO UPDATE SET username = ${`${packet.author.username}#${packet.author.discriminator}`} RETURNING isbanned, saves`.catch(()=>{})
    if (!countUser[0]) return;
    if (countUser[0].isbanned) return sharder.rest.channels.createReaction(packet.channel_id, packet.id, "⛔").catch(()=>{});
    newNumber.setCountUser(countUser[0])

    newNumber.failReason()

    if (countChannel.hook_enabled && countChannel.hook_id !=="" && countChannel.hook_token !=="" && newNumber.reason !== "noFailWrong") await newNumber.exucuteWebhook()
    
    newNumber.messageReactions()

    newNumber.updateLogs()
}