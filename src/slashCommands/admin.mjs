/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import {ownerID} from '/static/settings.mjs'

export const commandLogic = async (interaction, sharder) => {    
    if (interaction.member.id !== ownerID) return interaction.createMessage({"flags":64, "embeds": [{"title": "You are not my developer","color": 14680145}]}).catch(()=>{});
    
    await interaction.defer();

    switch (interaction.data.options.raw[0].name){
        case "updatecmds":
            const localCommands = Array.from(sharder.commands.keys()).map(name => {
                const {options, description} = sharder.commands.get(name).commandFile
                return {name, options, description}
            })

            sharder.application.bulkEditGlobalCommands(localCommands)

            interaction.editOriginal({"embeds": [{"title": `Changed ${localCommands.length} commands`,"color": 14680145}]}).catch(()=>{});
        break;
        case "ban-user":
            const banReponce = (await pgPool`UPDATE users SET isbanned = true WHERE userid = ${interaction.data.options.raw[0].options[0].value} RETURNING username`)[0];
            if (!banReponce) return interaction.editOriginal({"embeds": [{"title": "User not found", "color": 14680145}]}).catch(()=>{});

            interaction.editOriginal({"embeds": [{"title": "User banned", "fields": [{"name": "User","value": `<@${interaction.data.options.raw[0].options[0].value}> (${banReponce.username})`,"inline": true},{"name": "Banned by","value": `<@${interaction.user.id}> (${interaction.user.username}#${interaction.user.discriminator})`,"inline": true}], "color": 14680145}]}).catch(()=>{});
        break;
        case "unban-user":
            const unbanReponce = (await pgPool`UPDATE users SET isbanned = false WHERE userid = ${interaction.data.options.raw[0].options[0].value} RETURNING username`)[0];
            if (!unbanReponce) return interaction.editOriginal({"embeds": [{"title": "User not found", "color": 14680145}]}).catch(()=>{});
            
            interaction.editOriginal({"embeds": [{"title": "User unbanned", "fields": [{"name": "User","value": `<@${interaction.data.options.raw[0].options[0].value}> (${unbanReponce.username})`,"inline": true},{"name": "Unbanned by","value": `<@${interaction.user.id}> (${interaction.user.username}#${interaction.user.discriminator})`,"inline": true}], "color": 14680145}]}).catch(()=>{});
        break;
    }
}

export const description = "⚙️ Owner utilities"

export const category = "Owner" 

export const options = [
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