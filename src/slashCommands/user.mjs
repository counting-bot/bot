/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import pgPool from '../utils/db.mjs'

export const commandLogic = async (interaction) => {
    const user = interaction.data.options.resolved.users.first() ?? interaction.member.user;
    const rawdatafromtable = (await pgPool`WITH usersaves AS (SELECT saves, max_saves FROM users WHERE userid = ${user.id}), userstats AS (SELECT SUM(wrongcount) as wrongnumbers, SUM(correctcount) as correctnumbers, SUM(savesused)as savednumbers FROM channellb WHERE userid = ${user.id}), userrank AS (SELECT rownr FROM (SELECT ROW_NUMBER() OVER (ORDER BY SUM(correctcount) desc) AS RowNr, userid FROM channellb group by userid) sub WHERE sub.userid = ${user.id}) SELECT saves, max_saves, correctnumbers, wrongnumbers, savednumbers, rownr FROM usersaves, userstats, userrank`)[0];
    if (!rawdatafromtable) return interaction.createMessage({"flags":64, "embeds": [{"title": "Error","description": "I dont have any statistics for this user. Have they counted yet?","color": 14680145}]}).catch(()=>{});

    const guildUser = (await pgPool`WITH userlist AS (SELECT userlist.userid, SUM(userlist.correctcount) AS correct, SUM(userlist.wrongcount) AS wrong, SUM(userlist.savesused) AS saved, MAX(highestcount) FROM channellb userlist JOIN users names ON userlist.userid = names.userid WHERE guildid = ${interaction.channel.guild.id} GROUP BY userlist.userid) SELECT * FROM userlist WHERE userlist.userid = ${user.id}`)[0];
    const guildUserIndex = await pgPool`WITH userlist AS (SELECT userlist.userid, SUM (correctcount) AS correctcount FROM channellb userlist JOIN users names ON userlist.userid = names.userid WHERE guildid = ${interaction.channel.guild.id} GROUP BY userlist.userid) SELECT rownr FROM (SELECT ROW_NUMBER() OVER (ORDER BY correctcount desc) AS RowNr, userid FROM userlist) sub WHERE sub.userid = ${user.id}`;

    let fields = [{"name": "Global Stats","value":`Accuracy: **${((rawdatafromtable.correctnumbers / (rawdatafromtable.wrongnumbers + rawdatafromtable.correctnumbers))*100).toFixed(2)}%**\n✅: **${rawdatafromtable.correctnumbers.toLocaleString()}**\n❌: **${rawdatafromtable.wrongnumbers.toLocaleString()}**\n Total: **${(rawdatafromtable.correctnumbers + rawdatafromtable.wrongnumbers).toLocaleString()}**\n 🆘 Saves left: **${rawdatafromtable.saves.toFixed(2)}/${rawdatafromtable.max_saves}**\n 🆘 Saves used: **${rawdatafromtable.savednumbers.toLocaleString()}**\nRank: **#${rawdatafromtable.rownr.toLocaleString()}**`, "inline": true}]
    if (guildUser) fields.push({"name": "Server stats","value":`Accuracy: **${((guildUser.correct / (guildUser.wrong + guildUser.correct))*100).toFixed(2)}**%\n✅: **${guildUser.correct.toLocaleString()}**\n❌: **${guildUser.wrong.toLocaleString()}**\n Total: **${(guildUser.correct+guildUser.wrong).toLocaleString()}**\n🆘 Saves used: **${guildUser.saved.toLocaleString()}**\nHighest count: **${guildUser.max.toLocaleString()}**\nRank: **#${guildUserIndex[0].rownr.toLocaleString()}**`, "inline": true})

    interaction.createMessage({"embeds": [{"title": `Stats for ${user.username}#${user.discriminator}`,fields,"color": 14680145}]}).catch(()=>{});
}

export const description = "Shows your counting statistics"

export const category = "General"

export const options = [
    {
        "name": "user",
        "description": "The user to get counting statistics for",
        "type": 6,
    }
]