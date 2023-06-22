/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../../utils/db.mjs'
import {getMode, modeChoices} from 'gamemodeconverion'

export default {
    name: "set",
    commandLogic: async (interaction, sharder) => {
        if ((interaction.member.permissions & 1 << 3) !== 8) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "You must be the owner of this server or an administrator","color": 14680145}]}}).catch(()=>{});
        
        const channel = (await pgPool`SELECT difficulty FROM data WHERE channelid = ${interaction.channel_id}`)[0];
        if (!channel) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "This channel is not a counting channel","color": 14680145}]}}).catch(()=>{});
        
        switch (interaction.data.options[0].name){
            case "goal":
                pgPool`UPDATE data SET goal = ${interaction.data.options[0].options[0].value}, goal_date = localtimestamp WHERE channelid = ${interaction.channel_id}`.catch(err=>{});
                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `The goal for this channel is now ${(interaction.data.options[0].options[0].value===0) ? "disabled": getMode(channel.difficulty).fromDecimal(interaction.data.options[0].options[0].value)}`,"color": 14680145}]}}).catch(()=>{});
            break;
            case "mode":
                const {fromDecimal, startingNum, name: diffFileName} = getMode(interaction.data.options[0].options[0].value)

                pgPool`UPDATE data SET difficulty = ${interaction.data.options[0].options[0].value}, last_num = ${0}, previos_sender = ${''} WHERE channelid = ${interaction.channel_id}`.catch(err=>{});
                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `Mode set to ${diffFileName}`, "description": `The next number is: ${fromDecimal(startingNum)}`,"color": 14680145}]}}).catch(()=>{});
            break;
            case "reaction":    
                switch(interaction.data.options[0].options[0].value){
                    case 'high score':
                        pgPool`UPDATE channelsettings SET hs_react = ${interaction.data.options[0].options[1].value.replace(/<:|>/g,"")} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case 'correct':
                        pgPool`UPDATE channelsettings SET react = ${interaction.data.options[0].options[1].value.replace(/<:|>/g,"")} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case 'wrong':
                        pgPool`UPDATE channelsettings SET wrongreact = ${interaction.data.options[0].options[1].value.replace(/<:|>/g,"")} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                }
                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `The ${interaction.data.options[0].options[0].value} reaction is now`,"description":interaction.data.options[0].options[1].value,"color": 14680145}]}}).catch(()=>{});
            break;
            case "fail-message":
                switch(interaction.data.options[0].options[0].value){
                    case 'dubbleuser':
                        pgPool`UPDATE failtexts SET dubbleuser = ${interaction.data.options[0].options[1].value} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case 'baknumber':
                        pgPool`UPDATE failtexts SET baknumber = ${interaction.data.options[0].options[1].value} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case 'skippednum':
                        pgPool`UPDATE failtexts SET skippednum = ${interaction.data.options[0].options[1].value} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                    case 'dubblenumber':
                        pgPool`UPDATE failtexts SET dubblenumber = ${interaction.data.options[0].options[1].value} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    break;
                }
                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `The ${interaction.data.options[0].options[0].value} fail message is now`,"description":interaction.data.options[0].options[1].value,"color": 14680145}]}}).catch(()=>{});
            break;
            case "fail-role":
                if (interaction.data.options[0].options[1].value){
                    // set fail role time
                    const failRole = await pgPool`SELECT roleid FROM failrole WHERE channelid = ${interaction.channel_id}`
                    if (failRole[0]) pgPool`UPDATE failrole SET roleid = ${interaction.data.options[0].options[0].value} WHERE channelid = ${interaction.channel_id}`.catch(err=>{})
                    else pgPool`INSERT INTO failrole (roleid, channelid) VALUES (${interaction.data.options[0].options[0].value}, ${interaction.channel_id})`.catch(err=>{})
                }else pgPool`DELETE FROM failrole WHERE channelid = ${interaction.channel_id}`.catch(err=>{});

                sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `The fail role is now`,"description": interaction.data.options[0].options[1].value ? `<@&${interaction.data.options[0].options[0].value}>` : "disabled","color": 14680145}]}}).catch(()=>{});
            break;
        }
    },
    description: "🔑 Sets diffrent parts of the bot like: goal, reaction, and mode",
    category: "Customization",
    options: [
        {
            "name": "goal",
            "description": "Sets a goal to count to. When the goal reached the time since the goal was set will be showen.",
            "type": 1,
            "options":[
                {
                    "name": "goal",
                    "description": "The goal to count to",
                    "type": 10,
                    "required": true,
                }
            ]
        },
        {
            "name": "mode",
            "description": "Changes the counting mode",
            "type": 1,
            "options":[
                {
                    "name": "mode",
                    "description": "The counting mode to change the channel",
                    "type": 3,
                    "required": true,
                    "choices": modeChoices
                }
            ]
        },
        {
            "name": "reaction",
            "description": "Change the reaction that the bot reacts with",
            "type": 1,
            "options":[
                {
                    "name": "event",
                    "description": "The reaction to change",
                    "type": 3,
                    "required": true,
                    "choices": [
                        {
                            "name": "correct",
                            "value": "correct"
                        },
                        {
                            "name": "high score",
                            "value": "high score"
                        },
                        {
                            "name": "wrong",
                            "value": "wrong"
                        }
                    ]
                },
                {
                    "name": "reaction",
                    "description": "The reaction for the bot to react with",
                    "type": 3,
                    "required": true,
                }
            ]
        },
        {
            "name": "fail-message",
            "description": "Change the message the bot sends when the count is reset",
            "type": 1,
            "options":[
                {
                    "name": "event",
                    "description": "The message to change",
                    "type": 3,
                    "required": true,
                    "choices": [
                        {
                            "name": "same counter twice",
                            "value": "dubbleuser"
                        },
                        {
                            "name": "back in numbers",
                            "value": "baknumber"
                        },
                        {
                            "name": "number skiped",
                            "value": "skippednum"
                        },
                        {
                            "name": "same number twice",
                            "value": "dubblenumber"
                        }
                    ]
                },
                {
                    "name": "message",
                    "description": "The message for the bot to send. Use ++one++ as a placeholder for 1",
                    "type": 3,
                    "required": true,
                }
            ]
        },
        {
            "name": "fail-role",
            "description": "Apply a role to the user who failed",
            "type": 1,
            "options":[
                {
                    "name": "role",
                    "description": "The role to apply when a wrong count is recived",
                    "type": 8,
                    "required": true,
                },
                {
                    "name": "toggle",
                    "description": "Enable or disable the fail role",
                    "type": 5,
                    "required": true,
                }
                // {
                //     "name": "remove after",
                //     "description": "remove the fail role after this time has passed",
                //     "type": 8,
                //     "required": false,
                // }
            ]
        }    
    ]
}