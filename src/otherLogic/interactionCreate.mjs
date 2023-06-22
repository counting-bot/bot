/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
export default async (packet, sharder)=>{
    if (packet.type === 3) return sharder.emit("componentInteract", packet)

    if (!sharder.commands) return sharder.rest.interactions.createInteractionResponse(packet.id, packet.token, { type: 4, data: {"flags":64, "embeds": [{"title": `Commands have not loaded yet. Please try again in a few minutes.`,"color": 14680145}]}}).catch(()=>{}); 
    if (!packet.guild_id) return sharder.rest.interactions.createInteractionResponse(packet.id, packet.token, { type: 4, data: {"flags":64, "embeds": [{"title": `Slash commands are not support in direct messages.`,"color": 14680145}]}}).catch(()=>{}); 

    sharder.commands.get(packet.data.name).commandFile.commandLogic(packet, sharder)
}