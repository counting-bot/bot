/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import {getMode, modeChoices} from 'gamemodeconverion'
import formatScoreString from '../utils/scoreFormatting.mjs'

export const commandLogic = async (interaction, sharder) => {        
    switch (interaction.data.options.raw[0].name){
        case "server":          
            const guildUsers = await pgPool`SELECT username, SUM (correctcount) AS correctcount FROM channellb userlist JOIN users names ON userlist.userid = names.userid WHERE guildid = ${interaction.channel.guild.id} GROUP BY userlist.userid, names.username ORDER BY correctcount DESC FETCH FIRST 10 ROWS ONLY`;
            if (guildUsers.length === 0) return interaction.createMessage({"flags":64, "embeds": [{"title": `No users have counted in this server`,"color": 14680145}]}).catch((err)=>{});
            
            const userList = guildUsers.map(({username, correctcount}, index)=>formatScoreString(index, username, correctcount))
        
            interaction.createMessage({"embeds": [{"title": `User Leaderboard for ${interaction.channel.guild.name}`,"color": 14680145,"description": userList.join("\n")}]}).catch((err)=>{});
        break;
        case "users":
            const dbUsers = await pgPool`SELECT SUM(correctcount)as correctcount, username FROM channellb JOIN users ON channellb.userid = users.userid WHERE isbanned = false AND is_public = true group by channellb.userid, username order by correctcount desc fetch first 10 rows only`;
            const users = (await Promise.all(dbUsers.map(async ({correctcount,username}, index) => formatScoreString(index, username, correctcount)))).join("\n")
            
            interaction.createMessage({"embeds": [{"title": "User Leaderboard","description": users,"color": 14680145}]}).catch(()=>{}); 
        break;
        case "channels":
            const modeFile = getMode(interaction.data.options.raw[0].options[0]?.value ?? 0);

            const hsOutChannelList = await pgPool`SELECT hs, serverdata.name FROM data JOIN serverdata ON data.guildid = serverdata.serverid JOIN channelsettings ON channelsettings.channelid = data.channelid WHERE difficulty = ${interaction.data.options.raw[0].options[0]?.value ?? 0} AND hs_enabled = true ORDER BY hs DESC LIMIT 5`;
            const hsOut = hsOutChannelList.map(({hs, name}, index) => formatScoreString(index, name, modeFile.fromDecimal(hs)))
        
            const csOustChannelList = await pgPool`SELECT last_num, serverdata.name FROM data JOIN serverdata ON data.guildid = serverdata.serverid JOIN channelsettings ON channelsettings.channelid = data.channelid WHERE difficulty = ${interaction.data.options.raw[0].options[0]?.value ?? 0} AND hs_enabled = true ORDER BY last_num DESC LIMIT 5`;
            const csOust = csOustChannelList.map(({last_num, name}, index)=>formatScoreString(index, name, modeFile.fromDecimal(last_num)))
        
            interaction.createMessage({"embeds": [{"title": `Scores  || mode: ${modeFile.name}`,"color": 14680145,"fields": [{"name": "High scores","value": hsOut.join('\n'),"inline": true}, {"name": "Current scores","value": csOust.join("\n"),"inline": true}]}]}).catch((err)=>{});
        break;
    }
}

export const description = "Shows the different all time leaderboards"

export const category = "General" 

export const options = [
    {
        "name": "server",
        "description": "Shows the top 10 counters in the server",
        "type": 1
    },
    {
        "name": "users",
        "description": "Shows the top 10 counters",
        "type": 1
    },
    {
        "name": "channels",
        "description": "Lists the top 5 current and high scores",
        "type": 1,
        "options": [
            {
                "name": "mode",
                "description": "The mode to get scores for",
                "type": 3,
                "choices": modeChoices
            }
        ]
    }
]