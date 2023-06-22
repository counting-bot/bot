/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../../utils/db.mjs'

const commandOptions = [
    {
        "name": "setting",
        "description": "The setting to toggle",
        "type": 3,
        "required": true,
        "choices": [
            {
                "name": "saves",
                "value": "saves_enabled"
            },
            {
                "name": "math",
                "value": "mathenabled"
            },
            {
                "name": "easter-eggs",
                "value": "egg_enabled"
            },
            {
                "name": "word numbers",
                "value": "wordsenabled"
            },
            {
                "name": "message deleted warning",
                "value": "del_message"
            },
            { 
                "name": "duplicate number warning",
                "value": "enablewarning"
            },
            { 
                "name": "webhook mode",
                "value": "hooks"
            },
            { 
                "name": "show on leaderboard",
                "value": "hs_enabled"
            },
            { 
                "name": "ban user when fail",
                "value": "failban"
            },
            { 
                "name": "nofail mode",
                "value": "nofail"
            },
            { 
                "name": "solo mode",
                "value": "solo"
            }
        ]
    },
    {
        "name": "status",
        "description": "Whether to toggle the setting on or off",
        "type": 3,
        "required": true,
        "choices": [
            {
                "name": "On",
                "value": "true"
            },
            {
                "name": "Off",
                "value": "false"
            }
        ]
    }
]

export default {
    name: "toggle",
    commandLogic: async (interaction, sharder) => {
        if ((interaction.member.permissions & 1 << 3) !== 8) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "You must be the owner of this server or an administrator","color": 14680145}]}}).catch(()=>{});
        
        const channel = await pgPool`SELECT * FROM channelsettings WHERE channelid = ${interaction.channel_id}`;
        if (!channel[0]) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "This channel is not a counting channel","color": 14680145}]}}).catch(()=>{});
        
        const onOff = JSON.parse(interaction.data.options[1].value);

        switch (interaction.data.options[0].value){
            case "hooks":            
                if (onOff){                 
                    const hook = await  sharder.rest.webhooks.create(interaction.channel_id, {name: "Counting", reason: "Webhook mode enabled"}).catch(()=>{})
                    if (!hook) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error", "description": "Webhook not made. Check channel and role permissions. Try remove existing channel webhooks if any.", "color": 14680145}]}}).catch(()=>{});
                    
                    pgPool`UPDATE data SET hook_id = ${hook.id}, hook_token = ${hook.token} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                }else {
                    pgPool`UPDATE data SET hook_id = '', hook_token = '' WHERE channelid = ${interaction.channel_id}`.catch(err=>{});
                    sharder.rest.webhooks.delete(channel[0].hook_id).catch(()=>{})
                }

                pgPool`UPDATE channelsettings SET hook_enabled = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
            break;   
            case "hs_enabled":
                pgPool`UPDATE channelsettings SET hs_enabled = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{});
                const guild = await sharder.guildCache.get(interaction.guild_id)
                pgPool`UPDATE serverdata SET name = ${onOff ? guild?.name : ''}, icon = ${onOff ? guild?.icon : ''} WHERE serverid = ${interaction.guild_id}`.catch(err=>{})
            break;
            default:
                switch(interaction.data.options[0].value){
                    case "saves_enabled":
                        pgPool`UPDATE channelsettings SET saves_enabled = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "mathenabled":
                        pgPool`UPDATE channelsettings SET mathenabled = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "egg_enabled":
                        pgPool`UPDATE channelsettings SET egg_enabled = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "wordsenabled":
                        pgPool`UPDATE channelsettings SET wordsenabled = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "del_message":
                        pgPool`UPDATE channelsettings SET del_message = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "enablewarning":
                        pgPool`UPDATE channelsettings SET enablewarning = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "hooks":
                        pgPool`UPDATE channelsettings SET hooks = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "hs_enabled":
                        pgPool`UPDATE channelsettings SET hs_enabled = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "failban":
                        pgPool`UPDATE channelsettings SET failban = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "nofail":
                        pgPool`UPDATE channelsettings SET nofail = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case "solo":
                        pgPool`UPDATE channelsettings SET solo = ${onOff} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                }
            break;    
        }    
    
        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `${commandOptions[0].choices.find(choice=>choice.value===interaction.data.options[0].value).name} is ${onOff ? "enabled" : "disabled"}`,"color": 14680145}]}}).catch(()=>{});
    },
    description: "🔑 Toggles different settings for counting channels",
    category: "Customization",
    options: commandOptions
}