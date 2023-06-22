/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../../utils/db.mjs'

export default {
    name: "showuserlb",
    commandLogic: async (interaction, sharder) => {
        pgPool`UPDATE users SET is_public = ${interaction.data.options[0].value} WHERE userid = ${interaction.member.user.id}`.catch(err=>{});

        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": `You will be ${interaction.data.options[0].value ? 'showen': 'hidden'} on the public leaderboards.`,"color": 14680145}]}}).catch(()=>{});
    },
    description: "Shows you on the public leaderboards",
    category: "User",
    options: [
        {
            "name": "enabled",
            "description": "Whether or not you want to be shown on the public user leaderboards",
            "type": 5,
            "required": true,
        }
    ]
}