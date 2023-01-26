/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'

export const commandLogic = async (interaction) => {
    pgPool`UPDATE users SET is_public = ${interaction.data.options.raw[0].value} WHERE userid = ${interaction.member.id}`.catch(err=>{});

    interaction.createMessage({"embeds": [{"title": `You will be ${interaction.data.options.raw[0].value ? 'showen': 'hidden'} on the public leaderboards.`,"color": 14680145}]}).catch(()=>{});
}

export const description = "Shows you on the public leaderboards"

export const category = "User" 

export const options = [
    {
        "name": "enabled",
        "description": "Whether or not you want to be shown on the public user leaderboards",
        "type": 5,
        "required": true,
    }
]