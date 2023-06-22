/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import {getMode} from 'gamemodeconverion'
import pgPool from '../../utils/db.mjs'

export default {
    name: "channel",
    commandLogic: async (interaction, sharder) => {
        const channelID = interaction.data?.options?.[0].value ?? interaction.channel_id

        const dbChannel = (await pgPool`WITH rankdata AS (SELECT rownr FROM (SELECT ROW_NUMBER() OVER (ORDER BY hs desc) AS RowNr, channelid FROM data) sub WHERE sub.channelid = ${channelID}), channeldata as (SELECT difficulty, last_num, hs, hs_date, hs_user, previos_sender, saves, max_saves, savednumbers, name FROM data WHERE channelid = ${channelID}) SELECT * FROM channeldata, rankdata`)[0];
        if (!dbChannel) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "ERROR","description": "Please run this command in a counting channel or mention a counting channel as the first argument.","color": 14680145}]}}).catch(()=>{});
        
        const diffFile = getMode(dbChannel.difficulty)

        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `Stats for ${dbChannel.name}`,"description": `Mode: ${diffFile.name}\nCurrent Score: ${Number(dbChannel.last_num.toFixed(2)).toLocaleString()} (${(diffFile.fromDecimal(dbChannel.last_num))})\nHigh Score: ${Number(dbChannel.hs.toFixed(2)).toLocaleString()} (${(await diffFile.fromDecimal(dbChannel.hs))})\nHigh Score Date: <t:${Math.floor(new Date(dbChannel.hs_date).getTime()/1000)}:R>\nHigh score user: <@${dbChannel.hs_user}>\n Last Counter: <@${dbChannel.previos_sender}>\nSaves remaining: **${dbChannel.saves}/${dbChannel.max_saves}**.\nSaves used: **${dbChannel.savednumbers}**\nRank: **#${dbChannel.rownr.toLocaleString()}**`,"color": 14680145}]}}).catch(()=>{}); 
    },
    description: "Shows statistics for a counting channel",
    category: "General",
    options: [
        {
            "name": "channel",
            "description": "A counting channel to get info about",
            "type": 7,
            "channel_types":[
                0
            ]
        }
    ]
}