/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../../utils/db.mjs'

export default {
    name: "sendsave",
    commandLogic: async (interaction, sharder) => {
        if (!interaction.data.resolved || (interaction.data.resolved.channels && interaction.data.resolved.users)) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Specify a channel or user","color": 14680145}]}}).catch(()=>{});
        if (interaction.data.options[0].value <= 0) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Can not send negative saves"}]}}).catch(()=>{});

        const interactionResolvedUser = !!interaction.data.resolved.users
        const interactionResponce = interactionResolvedUser ? interaction.data.resolved.users : interaction.data.resolved.channels
        const reciverID = interactionResponce[Object.keys(interactionResponce)[0]].id

        if (reciverID === interaction.member.user.id) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Cant send saves to a your self"}]}}).catch(()=>{});
        if (interactionResolvedUser && interactionResponce.bot) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Cant send saves to a bot"}]}}).catch(()=>{});

        const exists = await pgPool`SELECT saves FROM ${pgPool(interactionResolvedUser ? 'users' : 'data')} WHERE ${pgPool( interactionResolvedUser ? 'userid' : 'channelid' )} = ${ reciverID }`;
        if (!exists[0]) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": `This ${interactionResolvedUser?"user":"channel"} is not registered with the bot`}]}}).catch(()=>{});

        if (!interactionResolvedUser){
            const saves_enabled = await pgPool`SELECT saves_enabled FROM channelsettings WHERE channelid = ${ reciverID }`;
            if (!saves_enabled[0].saves_enabled) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": `Saves are disabled for this channel`}]}}).catch(()=>{});
        }

        const taxAmount = interactionResolvedUser ? 0.25 : 0.5

        const deductUser = await pgPool`SELECT saves, max_saves FROM users WHERE userid = ${interaction.member.user.id}`;
        if (!deductUser[0]) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "I dont have you in my database. Have you counted yet?"}]}}).catch(()=>{});
        if ((deductUser[0].saves - (interaction.data.options[0].value + taxAmount)) < 0) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "You dont have enough saves to transfer, **" + (interaction.data.options[0].value + taxAmount) + "** needed"}]}}).catch(()=>{});
        
        const deposit = await pgPool`SELECT saves, max_saves FROM ${pgPool(interactionResolvedUser ? 'users' : 'data')} WHERE ${pgPool( interactionResolvedUser ? 'userid' : 'channelid' )} = ${ reciverID }`;
        if ((deposit[0].saves + interaction.data.options[0].value - taxAmount) > deposit[0].max_saves) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Cant transfer **" + interaction.data.options[0].value + "** to this location. Amount sent exceeds max of target."}]}}).catch(()=>{});
        
        if (interactionResolvedUser) pgPool`UPDATE users SET saves = ${(deposit[0].saves + interaction.data.options[0].value)} WHERE userid = ${reciverID}`.catch(err=>{});
        else pgPool`UPDATE data SET saves = ${(deposit[0].saves + interaction.data.options[0].value)} WHERE channelid = ${reciverID}`.catch(err=>{});
        pgPool`UPDATE users SET saves = ${(deductUser[0].saves - (interaction.data.options[0].value + taxAmount))} WHERE userid = ${interaction.member.user.id}`.catch(err=>{})

        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": "Sent","color": 14680145,"description": `Sent **${interaction.data.options[0].value}** saves to <${interactionResolvedUser ? "@": "#"}${reciverID}>. A tax of ${taxAmount} was applied. Saves remining: ${(deductUser[0].saves - (interaction.data.options[0].value + taxAmount))}/${deductUser[0].max_saves}`}]}}).catch(()=>{});    
    },
    description: "Sends a save from one user to another",
    category: "User",
    options: [
        {
            "name": "amount",
            "description": "The number of saves to send",
            "type": 10,
            "required": true,
        },
        {
            "name": "user",
            "description": "The user send a save to",
            "type": 6,
        },
        {
            "name": "channel",
            "description": "The counting channel send a save to",
            "type": 7,
            "channel_types":[
                0
            ]
        }
    ]
}