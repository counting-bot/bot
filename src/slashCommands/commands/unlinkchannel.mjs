/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../../utils/db.mjs'
import erisComponentsCollector from '../../utils/erisComponentsCollector.mjs'

export default {
    name: "unlinkchannel",
    commandLogic: async (interaction, sharder) => {
        if ((interaction.member.permissions & 1 << 3) !== 8) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "You must be the owner of this server or an administrator","color": 14680145}]}}).catch(()=>{});
        
        const channelID = interaction.data?.options?.[0].value ?? interaction.channel_id
        
        const unlinkChannel = (await pgPool`SELECT channelid FROM data WHERE channelid = ${channelID}`)[0];
        if (!unlinkChannel) return sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"flags":64, "embeds": [{"title": "This channel is not a counting channel","color": 14680145}]}}).catch(()=>{});    

        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: 
            {
                "embeds": [{"title": "Are you sure you want to continue?", "description": "All information stored for this channel will be permanently deleted", "color": 16711680}],
                "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "label": "Cancel",
                                "style": 3,
                                "custom_id": "unlink_cancel",
                            },
                            {
                                "type": 2,
                                "label": "Confirm",
                                "style": 4,
                                "custom_id": "unlink_confirm"
                            }
                        ]
                    }
                ]
            }
        }).catch(()=>{});
        
        const filter = ((body) => {
            if (body.member.user.id !== interaction.member.user.id){
                sharder.rest.interactions.createInteractionResponse(body.id, body.token, { type: 4, data: {"flags":64, "embeds": [{"title": "This button is not for you","color": 14680145}]}}).catch(()=>{})
                return false;
            }
            return body.data.custom_id === 'unlink_confirm' || body.data.custom_id === 'unlink_cancel'
        });

        const collector = new erisComponentsCollector(sharder, filter, interaction.channel_id, { time: 10000 })

        collector.on('collect', async (resBody) => {
            if (resBody.data.custom_id === "unlink_cancel") {
                sharder.rest.interactions.createInteractionResponse(resBody.id, resBody.token, { type: 6, data: {} }).catch(()=>{});
                return collector.stop()
            }

            pgPool`DELETE FROM data WHERE channelid = ${channelID}`.catch(err=>{});
            pgPool`DELETE FROM channelsettings WHERE channelid = ${channelID}`.catch(err=>{});
            pgPool`DELETE FROM failtexts WHERE channelid = ${channelID}`.catch(err=>{});
            pgPool`DELETE FROM countinglog WHERE channelid = ${channelID}`.catch(err=>{});
            
            sharder.rest.interactions.createInteractionResponse(resBody.id, resBody.token, { type: 6, data: {} }).catch(()=>{});
            if (channelID === interaction.channel_id) sharder.rest.interactions.editOriginalMessage(interaction.application_id, interaction.token, {"embeds": [{"title": "Channel unlinked", "color": 14680145}], "components": [
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "Cancel",
                            "style": 3,
                            "custom_id": "unlink_cancel",
                            "disabled": true
                        },
                        {
                            "type": 2,
                            "label": "Confirm",
                            "style": 4,
                            "custom_id": "unlink_confirm",
                            "disabled": true
                        }
                    ]
                }
            ]}).catch(()=>{});
            else {
                sharder.rest.channels.createMessage(channelID, {"embeds": [{"title": "Channel unlinked", "color": 14680145}], "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "label": "Cancel",
                                "style": 3,
                                "custom_id": "unlink_cancel",
                                "disabled": true
                            },
                            {
                                "type": 2,
                                "label": "Confirm",
                                "style": 4,
                                "custom_id": "unlink_confirm",
                                "disabled": true
                            }
                        ]
                    }
                ]}).catch(()=>{});
            }
        });

        collector.on('end', (collected) => {
            if (collected.length === 0 || collected[0].data.custom_id === "unlink_cancel"){
                sharder.rest.interactions.editOriginalMessage(interaction.application_id, interaction.token, {
                    "embeds": [{"title": "Aborted", 
                    "color": 14680145}],
                    "components": [
                        {
                            "type": 1,
                            "components": [
                                {
                                    "type": 2,
                                    "label": "Cancel",
                                    "style": 3,
                                    "custom_id": "unlink_cancel",
                                    "disabled": true
                                },
                                {
                                    "type": 2,
                                    "label": "Confirm",
                                    "style": 4,
                                    "custom_id": "unlink_confirm",
                                    "disabled": true
                                }
                            ]
                        }
                    ]
                }).catch(()=>{});
            } 
        });
    },
    description: "🔑 Deletes the counting channel from database",
    category: "Admin",
    options: [
        {
            "name": "channel",
            "description": "Unlink a channel from the bot",
            "type": 7,
            "channel_types":[
                0
            ]
        }
    ]
}