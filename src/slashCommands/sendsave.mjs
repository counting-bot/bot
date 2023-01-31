/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'

export const commandLogic = async (interaction) => {
    if ((interaction.data.resolved.channels.size === 0 && interaction.data.resolved.users.size === 0) || (interaction.data.resolved.channels.size === 1 && interaction.data.resolved.users.size === 1)) return interaction.createMessage({"flags":64, "embeds": [{"title": "Specify a channel or user","color": 14680145}]})

    const interactionResolvedUser = interaction.data.resolved.users.size === 1

    const interactionResponce = interactionResolvedUser ? interaction.data.resolved.users : interaction.data.resolved.channels
    const reciverID = interactionResponce.first().id

    if (reciverID === interaction.member.id) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Cant send saves to a your self"}]})
    if (interactionResolvedUser && interactionResponce.bot) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Cant send saves to a bot"}]})

    if (interaction.data.options.raw[0].value <= 0) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Can not send negative saves"}]})

    const exists = await pgPool`SELECT saves FROM ${pgPool(interactionResolvedUser ? 'users' : 'data')} WHERE ${pgPool( interactionResolvedUser ? 'userid' : 'channelid' )} = ${ reciverID }`;
    if (exists.length !== 1) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": `This ${interactionResolvedUser?"user":"channel"} is not registered with the bot`}]})

    const taxAmount = interactionResolvedUser ? 0.25 : 0.5

    const deductUser = await pgPool`SELECT saves, max_saves FROM users WHERE userid = ${interaction.member.id}`;
    if (!deductUser.length === 1) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "I dont have you in my database. Have you counted yet?"}]}).catch(()=>{});
    if ((deductUser[0].saves - (interaction.data.options.raw[0].value + taxAmount)) < 0) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "You dont have enough saves to transfer, **" + (interaction.data.options.raw[0].value + taxAmount) + "** nedded"}]})
    
    const deposit = await pgPool`SELECT saves, max_saves FROM ${pgPool(interactionResolvedUser ? 'users' : 'data')} WHERE ${pgPool( interactionResolvedUser ? 'userid' : 'channelid' )} = ${ reciverID }`;
    if ((deposit[0].saves + interaction.data.options.raw[0].value - taxAmount) > deposit[0].max_saves) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","color": 14680145,"description": "Cant transfer **" + interaction.data.options.raw[0].value + "** to this location. Amount sent exceeds max of target."}]}).catch(()=>{});
    
    if (interactionResolvedUser) pgPool`UPDATE users SET saves = ${(deposit[0].saves + interaction.data.options.raw[0].value)} WHERE userid = ${reciverID}`.catch(err=>{});
    else pgPool`UPDATE data SET saves = ${(deposit[0].saves + interaction.data.options.raw[0].value)} WHERE channelid = ${reciverID}`.catch(err=>{});
    pgPool`UPDATE users SET saves = ${(deductUser[0].saves - (interaction.data.options.raw[0].value + taxAmount))} WHERE userid = ${interaction.member.id}`.catch(err=>{})

    interaction.createMessage({"embeds": [{"title": "Sent","color": 14680145,"description": `Sent **${interaction.data.options.raw[0].value}** saves to <${interactionResolvedUser ? "@": "#"}${reciverID}>. A tax of ${taxAmount} was applied. Saves remining: ${(deductUser[0].saves - (interaction.data.options.raw[0].value + taxAmount))}/${deductUser[0].max_saves}`}]}).catch(()=>{});    
}

export const description = "Sends a save from one user to another"

export const category = "User" 

export const options = [
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