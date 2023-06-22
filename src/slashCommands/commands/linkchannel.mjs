/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import {modeChoices} from 'gamemodeconverion'
import pgPool from '../../utils/db.mjs'

export default {
    name: "linkchannel",
    commandLogic: async (interaction, sharder) => {
        if ((interaction.member.permissions & 1 << 3) !== 8) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "You must be the owner of this server or an administrator","color": 14680145}]}}).catch(()=>{});

        const channelID = interaction.data?.options?.find(item=>item.name=="channel")?.value ?? interaction.channel_id
        const mode = Number(interaction.data?.options?.find(item=>item.name=="mode")?.value ?? 0)

        const linkChannel = (await pgPool`SELECT * FROM data WHERE channelid = ${channelID}`);
        if (linkChannel.length === 1) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "This channel is already a counting channel","color": 14680145}]}}).catch(()=>{});

        pgPool`INSERT INTO data (channelid, guildid, name, difficulty) VALUES (${channelID}, ${interaction.guild_id}, ${(await sharder.channelCache.get(channelID))?.name}, ${mode})`.catch(err=>{})

        pgPool`INSERT INTO serverdata (serverid) VALUES (${interaction.guild_id}) ON CONFLICT (serverid) DO NOTHING`.catch(err=>{})

        pgPool`INSERT INTO channelsettings (channelid) VALUES (${channelID}) ON CONFLICT (channelid) DO NOTHING`.catch(err=>{})

        pgPool`INSERT INTO failtexts (channelid) VALUES (${channelID}) ON CONFLICT (channelid) DO NOTHING`.catch(err=>{})

        if (channelID === interaction.channel_id) sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": "Welcome","description": "There are four simple rules:\n 1) No skipping numbers\n2) No going back in numbers\n3) One person can't count two or more numbers in a row\n4) No botting or scripting\n\nIf you need help my help command is **/help**, [join the support server](https://counting.numselli.xyz/support) if you have any questions.","color": 14680145}]}}).catch(()=>{});
        else {
            sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 5}).catch(err=>{});
            sharder.rest.channels.createMessage(channelID, {"embeds": [{"title": "Welcome","description": "There are four simple rules:\n 1) No skipping numbers\n2) No going back in numbers\n3) One person can't count two or more numbers in a row\n4) No botting or scripting\n\nIf you need help my help command is **/help**, [join the support server](https://counting.numselli.xyz/support) if you have any questions.","color": 14680145}]}).catch(()=>{});
        }
    },
    description: "🔑 Makes a channel registered with the bot",
    category: "Admin",
    options: [
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
}