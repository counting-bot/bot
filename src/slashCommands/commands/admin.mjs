/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../../utils/db.mjs'
import commandList from '../commandList.mjs';

const { ownerID, clientID } = await import(process.env.NODE_ENV === "production" ? '/static/settings.mjs' : '../../static/settings.mjs');

export default {
    name: "admin",
    commandLogic: async (interaction, sharder) => {    
        if (interaction.member.user.id !== ownerID) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "You are not my developer","color": 14680145}]}}).catch(()=>{});
        
        switch (interaction.data.options[0].name){
            case "updatecmds":
                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 5}).catch(err=>{});

                sharder.rest.applicationCommands.bulkEditGlobalCommands(clientID, commandList)

                sharder.rest.interactions.editOriginalMessage(interaction.application_id, interaction.token, {"embeds": [{"title": `Changed ${commandList.length} commands`,"color": 14680145}]}).catch(()=>{});
            break;
            case "ban-user":
                const banReponce = (await pgPool`UPDATE users SET isbanned = true WHERE userid = ${interaction.data.options[0].options[0].value} RETURNING username`)[0];
                if (!banReponce) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": "User not found", "color": 14680145}]}}).catch(()=>{});

                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": "User banned", "fields": [{"name": "User","value": `<@${interaction.data.options[0].options[0].value}> (${banReponce.username})`,"inline": true},{"name": "Banned by","value": `<@${interaction.member.user.id}> (${interaction.member.user.username})`,"inline": true}], "color": 14680145}]}}).catch(()=>{});
            break;
            case "unban-user":
                const unbanReponce = (await pgPool`UPDATE users SET isbanned = false WHERE userid = ${interaction.data.options[0].options[0].value} RETURNING username`)[0];
                if (!unbanReponce) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": "User not found", "color": 14680145}]}}).catch(()=>{});
                
                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": "User unbanned", "fields": [{"name": "User","value": `<@${interaction.data.options[0].options[0].value}> (${unbanReponce.username})`,"inline": true},{"name": "Unbanned by","value": `<@${interaction.member.user.id}> (${interaction.member.user.username})`,"inline": true}], "color": 14680145}]}}).catch(()=>{});
            break;
        }
    },
    description: "⚙️ Owner utilities",
    category: "Owner",
    options: [
        {
            "name": "ban-user",
            "description": "bans a user from counting",
            "type": 1,
            "options":[
                {
                    "name": "user-id",
                    "description": "user id to ban",
                    "type": 3,
                    "required": true,
                }
            ]
        },
        {
            "name": "unban-user",
            "description": "un bans a user from counting",
            "type": 1,
            "options":[
                {
                    "name": "user-id",
                    "description": "user id to un ban",
                    "type": 3,
                    "required": true,
                }
            ]
        },
        {
            "name": "updatecmds",
            "description": "Refresh all slash commands",
            "type": 1,
        }
    ]
}