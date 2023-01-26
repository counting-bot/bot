/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import erisComponentsCollector from '../utils/erisComponentsCollector.mjs'

export const commandLogic = async (interaction, sharder) => {
    const help = {
        "embeds": [
            {
                "title": "Counting Help",
                "description": "Below is a list of my commands. If you have any questions, join the support server.",
                "fields": [],
                "color": 14680145,
            }
        ],
        "components": [
            {
                "type": 1,
                "components": [
                    {
                        "type": 2,
                        "label": "Support Server",
                        "url": "https://discord.gg/cz5ECsdPBT",
                        "style": 5,
                    },
                    {
                        "type": 2,
                        "label": "Reactions",
                        "style": 2,
                        "customID": 'reactions'
                    },
                    {
                        "type": 2,
                        "label": "Math",
                        "style": 2,
                        "customID": 'math'
                    }
                ]
            }
        ]
    }

    await Promise.all(
        Array.from(sharder.commands.keys()).map(command=>{
            if (command === "admin") return;
            const cmd = sharder.commands.get(command)
            const catagoryIndex = help.embeds[0].fields.findIndex(element => element.name === cmd.commandFile.category);
    
            if (catagoryIndex === -1) help.embeds[0].fields.push({ "name": cmd.commandFile.category, "value": `</${command}:${cmd.discordInfo.id}>`, "inline": true })
            else help.embeds[0].fields[catagoryIndex].value+=`\n</${command}:${cmd.discordInfo.id}>`;  
        }),
    )

    const filter = ((body) => {
        if (body.member.id !== interaction.member.id){
            body.createMessage({"flags":64, "embeds": [{"title": "This button is not for you","color": 14680145}]}).catch(()=>{})
            return false;
        }
        return body.data.customID === 'reactions' || body.data.customID === 'math'
    });

    interaction.createMessage(help).catch(()=>{});

    const collector = new erisComponentsCollector(sharder, filter, interaction.channelID, { time: 30000 })

    collector.on('collect', async (resBody) => {
        switch(resBody.data.customID){
            case 'reactions':
                resBody.createMessage({"flags":64, "embeds": [{"title": "Reactions", "description": "*Note: Correct, wrong, and high score reactions can be customized per channel.\nTo change reactions use the `/set reaction` command", "fields": [{"name": "Default Reactions", "value": "✅: Correct number*\n❌: Wrong number*\n🏆: New high score*\n💾: Channel or user save used\n⛔: User is banned, ignore the number"}], "color": 14680145}]}).catch(()=>{})
            break;
            case 'math':
                resBody.createMessage({"flags":64, "embeds": [{"title": "Math", image:{url: "https://cdn.discordapp.com/attachments/705821833223471144/997291987176800256/unknown.png"}, "color": 14680145}]}).catch(()=>{})
            break;
        }
    });

    collector.on('end', (collected) => {
        help.components[0].components[1].disabled = true;
        help.components[0].components[2].disabled = true;
        interaction.editOriginal(help).catch(()=>{});
    })
}

export const description = "Lists all commands"

export const category = "Info" 