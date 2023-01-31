/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'

export const commandLogic = async (interaction) => {
    const channelID = interaction.data.resolved?.channels.keys().next().value ?? interaction.channelID
    
    const logs = await pgPool`SELECT * FROM countinglog WHERE channelid = ${channelID} ORDER BY date ASC LIMIT 10`;
    if (logs.length === 0) return interaction.createMessage({"flags":64, "embeds": [{"title": "No logs for this channel","color": 14680145}]}).catch(()=>{});         
    const cdata = await pgPool`SELECT name FROM data WHERE channelid = ${channelID}`;

    const logsOut = logs.map(log=>`**Sender: ** <@${log.sender}> | **Number: ** ${log.number} | **Reason: ** ${log.reason} | [Message](https://discord.com/channels/${log.jumpurl})`)
   
    interaction.createMessage({"embeds": [{"title": `Server Logs | ${cdata[0].name}`,"description": logsOut.join("\n"),"color": 14680145}]}).catch(()=>{});         
}

export const description = "Veiw the last 10 recorded numbers"

export const category = "Info" 

export const options = [
    {
        "name": "channel",
        "description": "A counting channel to get logs for",
        "type": 7,
        "channel_types":[
            0
        ]
    }
]