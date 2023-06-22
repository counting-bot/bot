/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import numberCreated from "../countingLogic/numberCreated.mjs"
import numberDeleted from "../countingLogic/numberDeleted.mjs";
import interactionCreate from "../otherLogic/interactionCreate.mjs";

import channel from "../structures/channel.mjs";
import guild from "../structures/guild.mjs";

export default async (ipc, packet, shard)=>{
    packet.d.shard = shard
    switch(packet.t){
        case "MESSAGE_CREATE":
            numberCreated(packet.d, ipc)
        break;
        case "MESSAGE_DELETE": 
            numberDeleted(packet.d, ipc)
        break;
        case "INTERACTION_CREATE": 
            interactionCreate(packet.d, ipc)
        break;
        
        
        // channel cache
        case "CHANNEL_CREATE":
        case "CHANNEL_UPDATE": {
            if (packet.d.type !== 0) return;
            ipc.channelCache.set(packet.d.id, new channel(packet.d))
            break;
        }
        case "CHANNEL_DELETE": {
            if (packet.d.type !== 0) return;
            ipc.channelCache.delete(packet.d.id)
            break;
        }

        // guild cache
        case "GUILD_CREATE": {
            if (packet.d.unavailable) return;
            ipc.guildCache.set(packet.d.id, new guild(packet.d))
            packet.d.channels?.filter(c => c.type === 0).map(c=>ipc.channelCache.set(c.id, new channel(c)))
            break;
        }
        case "GUILD_UPDATE": {
            ipc.guildCache.set(packet.d.id, new guild(packet.d))
            break;
        }
        case "GUILD_DELETE": {
            if (packet.d.unavailable) return;
            ipc.guildCache.delete(packet.d.id)
            packet.d.channels?.filter(c => c.type === 0).map(c=>ipc.channelCache.del(c.id, new channel(c)))
            break;
        }
    }
}