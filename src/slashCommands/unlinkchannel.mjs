/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'
import erisComponentsCollector from '../utils/erisComponentsCollector.mjs'

export const commandLogic = async (interaction, sharder) => {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.createMessage({"flags":64, "embeds": [{"title": "You must be the owner of this server or an administrator","color": 14680145}]}).catch(()=>{});
    
    const channelID = interaction.data.resolved?.channels.keys().next().value ?? interaction.channelID
    
    const unlinkChannel = (await pgPool`SELECT channelid FROM data WHERE channelid = ${channelID}`)[0];
    if (!unlinkChannel) return  interaction.createMessage({"flags":64, "embeds": [{"title": "This channel is not a counting channel","color": 14680145}]}).catch(()=>{});    

    interaction.createMessage(
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
                            "customID": "unlink_cancel",
                        },
                        {
                            "type": 2,
                            "label": "Confirm",
                            "style": 4,
                            "customID": "unlink_confirm"
                        }
                    ]
                }
            ]
        }
    ).catch(()=>{});
      
    const filter = ((body) => {
        if (body.member.id !== interaction.member.id){
            body.createMessage({"flags":64, "embeds": [{"title": "This button is not for you","color": 14680145}]}).catch(()=>{})
            return false;
        }
        return body.data.customID === 'unlink_confirm' || body.data.customID === 'unlink_cancel'
    });

    const collector = new erisComponentsCollector(sharder, filter, interaction.channelID, { time: 10000 })

    collector.on('collect', async (resBody) => {
        if (resBody.data.customID === "unlink_cancel") {
            await resBody.deferUpdate();
            return collector.stop()
        }

        pgPool`DELETE FROM data WHERE channelid = ${channelID}`.catch(err=>{});
        pgPool`DELETE FROM channelsettings WHERE channelid = ${channelID}`.catch(err=>{});
        pgPool`DELETE FROM failtexts WHERE channelid = ${channelID}`.catch(err=>{});
        pgPool`DELETE FROM countinglog WHERE channelid = ${channelID}`.catch(err=>{});
        
        if (channelID === interaction.channelID) resBody.editParent({"embeds": [{"title": "Channel unlinked", "color": 14680145}]}).catch(()=>{});
        else {
            await resBody.deferUpdate();
            sharder.rest.channels.createMessage(channelID, {"embeds": [{"title": "Channel unlinked", "color": 14680145}]}).catch(()=>{});
        }
    });

    collector.on('end', (collected) => {
        if (collected.length === 0 || collected[0].data.customID === "unlink_cancel"){
            interaction.editOriginal({
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
                                "customID": "unlink_cancel",
                                "disabled": true
                            },
                            {
                                "type": 2,
                                "label": "Confirm",
                                "style": 4,
                                "customID": "unlink_confirm",
                                "disabled": true
                            }
                        ]
                    }
                ]
            }).catch(()=>{});
        }    
    });
}

export const description = "🔑 Deletes the counting channel from database"

export const category = "Admin" 

export const options = [
    {
        "name": "channel",
        "description": "Unlink a channel from the bot",
        "type": 7,
        "channel_types":[
            0
        ]
    }
]