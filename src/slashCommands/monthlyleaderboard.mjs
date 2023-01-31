/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import formatScoreString from '../utils/scoreFormatting.mjs'

export const commandLogic = async (interaction, sharder) => {        
    switch (interaction.data.options.raw[0].name){
        case "server":          
            const guildUsers = await pgPool`SELECT username, SUM (correctcount) AS correctcount FROM mothlychannellb userlist JOIN users names ON userlist.userid = names.userid WHERE guildid = ${interaction.channel.guild.id} GROUP BY userlist.userid, names.username ORDER BY correctcount DESC FETCH FIRST 10 ROWS ONLY`;
            if (guildUsers.length === 0) return interaction.createMessage({"flags":64, "embeds": [{"title": `No users have counted in this server`,"color": 14680145}]}).catch((err)=>{});
            
            const userList = guildUsers.map(({username, correctcount}, index)=>formatScoreString(index, username, correctcount))
        
            interaction.createMessage({"embeds": [{"title": `Monthly user Leaderboard for ${interaction.channel.guild.name}`,"color": 14680145,"description": userList.join("\n")}]}).catch((err)=>{});
        break;
        case "users":
            const dbUsers = await pgPool`SELECT username, SUM (correctcount) AS correctnumbers FROM mothlychannellb userlist JOIN users names ON userlist.userid = names.userid WHERE isbanned = false AND is_public = true GROUP BY userlist.userid, names.username ORDER BY correctnumbers DESC FETCH FIRST 10 ROWS ONLY`;
            const users = (await Promise.all(dbUsers.map(async ({correctnumbers,username}, index) => formatScoreString(index, username, correctnumbers)))).join("\n")
            
            interaction.createMessage({"embeds": [{"title": "Monthly user Leaderboard","description": users,"color": 14680145}]}).catch(()=>{}); 
        break;
        case "channels":
            const topServers = await pgPool`SELECT SERVERDATA.NAME, SUM(MOTHLYCHANNELLB.CORRECTCOUNT) AS TOTAL FROM MOTHLYCHANNELLB JOIN SERVERDATA ON SERVERDATA.SERVERID = MOTHLYCHANNELLB.GUILDID JOIN CHANNELSETTINGS ON CHANNELSETTINGS.CHANNELID = MOTHLYCHANNELLB.CHANNELID AND CHANNELSETTINGS.HS_ENABLED = TRUE GROUP BY MOTHLYCHANNELLB.GUILDID, SERVERDATA.NAME ORDER BY TOTAL DESC FETCH FIRST 10 ROWS ONLY`
            const topServersOut = topServers.map(({total, name}, index) => formatScoreString(index, name, total))

            interaction.createMessage({"embeds": [{"title": `Monthly top servers`,"color": 14680145,"fields": [{"name": "Numbers counted","value": topServersOut.join('\n'),"inline": true}]}]}).catch((err)=>{});
        break;
    }
}

export const description = "Shows the different monthy leaderboards"

export const category = "General" 

export const options = [
    {
        "name": "server",
        "description": "Shows the top 10 counters in the server for this month",
        "type": 1
    },
    {
        "name": "users",
        "description": "Shows the top 10 counters for this month",
        "type": 1
    },
    {
        "name": "channels",
        "description": "Lists the top 5 servers for this month",
        "type": 1,
        "options": [
        ]
    }
]