/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../../utils/db.mjs'

export default {
    name: "logs",
    commandLogic: async (interaction, sharder) => {
        const channelID = interaction.data?.options?.[0].value ?? interaction.channel_id
        
        const logs = await pgPool`SELECT * FROM countinglog WHERE channelid = ${channelID} ORDER BY date ASC LIMIT 10`;
        if (logs.length === 0) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "No logs for this channel","color": 14680145}]}}).catch(()=>{});         

        const logsOut = logs.map(log=>`**Sender: ** <@${log.sender}> | **Number: ** ${log.number} | **Reason: ** ${log.reason} | [Message](https://discord.com/channels/${interaction.guild_id}/${channelID}/${log.messageid})`)
    
        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `Server Logs | ${(await sharder.channelCache.get(channelID))?.name}`,"description": logsOut.join("\n"),"color": 14680145}]}}).catch(()=>{});         
    },
    description: "Veiw the last 10 recorded numbers",
    category: "Info",
    options: [
        {
            "name": "channel",
            "description": "A counting channel to get logs for",
            "type": 7,
            "channel_types":[
                0
            ]
        }
    ]
}