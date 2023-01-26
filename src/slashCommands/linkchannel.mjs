/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import {modeChoices} from 'gamemodeconverion'
import pgPool from '../utils/db.mjs'

export const commandLogic = async (interaction, sharder) => {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.createMessage({"flags":64, "embeds": [{"title": "You must be the owner of this server or an administrator","color": 14680145}]}).catch(()=>{});
        
    const channel = interaction.data.options.resolved.channels.first() ?? interaction.channel
    const mode = Number(interaction.data.options.raw[interaction.data.options.resolved.channels.size]?.value ?? 0)

    const linkChannel = (await pgPool`SELECT * FROM data WHERE channelid = ${channel.id}`);
    if (linkChannel.length === 1) return interaction.createMessage({"flags":64, "embeds": [{"title": "This channel is already a counting channel","color": 14680145}]}).catch(()=>{});

    pgPool`INSERT INTO data (channelid, guildid, name, difficulty) VALUES (${channel.id}, ${interaction.guildID}, ${channel.name}, ${mode})`.catch(err=>{})

    pgPool`INSERT INTO serverdata (serverid) VALUES (${interaction.guildID}) ON CONFLICT (serverid) DO NOTHING`.catch(err=>{})

    pgPool`INSERT INTO channelsettings (channelid) VALUES (${channel.id}) ON CONFLICT (channelid) DO NOTHING`.catch(err=>{})

    pgPool`INSERT INTO failtexts (channelid) VALUES (${channel.id}) ON CONFLICT (channelid) DO NOTHING`.catch(err=>{})

    if (channel.id === interaction.channelID) interaction.createMessage({"embeds": [{"title": "Welcome","description": "There are four simple rules:\n 1) No skipping numbers\n2) No going back in numbers\n3) One person can't count two or more numbers in a row\n4) No botting or scripting\n\nIf you need help my help command is **/help**, [join the support server](https://counting.numselli.xyz/support) if you have any questions.","color": 14680145}]}).catch(()=>{});
    else {
        await interaction.defer();
        sharder.rest.channels.createMessage(channel.id, {"embeds": [{"title": "Welcome","description": "There are four simple rules:\n 1) No skipping numbers\n2) No going back in numbers\n3) One person can't count two or more numbers in a row\n4) No botting or scripting\n\nIf you need help my help command is **/help**, [join the support server](https://counting.numselli.xyz/support) if you have any questions.","color": 14680145}]}).catch(()=>{});
    }
}

export const description = "🔑 Makes a channel registered with the bot"

export const category = "Admin" 

export const options = [
    {
        "name": "channel",
        "description": "Link a channel to the bot",
        "type": 7,
        "channel_types":[
            0
        ]
    },
    {
        "name": "mode",
        "description": "The counting mode to set the channel",
        "type": 3,
        "choices": modeChoices
    }
]