/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import { wordsToNumbers } from 'words-to-numbers'
import { evaluate } from 'expr-eval'
import { getMode } from 'gamemodeconverion'

import pgPool from '../utils/db.mjs'

const reactions = new Map(Object.entries({
    21: ["9️⃣", "➕", "🔟"],
    42: ["🇱", "🇮", "🇫", "🇪"],
    51: ["👽"],
    69: ["🇳", "🇮", "🇨", "🇪"],
    123: ["🔢"],
    300: ["🇸", "🇵", "🅰️", "🇷", "🇹", "🇦"],
    404: ["🤖"],
    420: ["🇧", "🇱", "🇦","🇿", "🇪", "➖", "🇮", "🇹"],
    666: ["😈"],
    747: ["✈️"],
    777: ["🎰"],
    911: ["🚓"],
    1337: ["🇱", "🇪", "3️", "🇹"]
}))

const modeReactions = new Map(
    Object.entries({
        3: {
            62: ["😮", "🍆"],
            161: ["🇮", "🇷", "🅾️", "🇳"],
            2349: ["🇨", "🇱", "🇮"],
            2587: ["😳"]
        },
        9: {
            151: ["🇨", "🇱", "🇮"], // add for roaman as well
        }
    })
)

export default class count {
    #bot
    #rawContent
    #messageid
    #channelid
    #memberid
    #guildid
    #countChannel
    #modeFile
    #redis
    #memberUsername
    #memberIcon
    #channelName
    #guildName
    #guildIcon

    constructor(message, countChannel, sharder, channelName, guild) {  
        this.#bot = sharder.rest
        this.#rawContent = message.content

        this.#messageid = message.id
        this.#channelid = message.channel_id
        this.#memberid = message.author.id
        this.#guildid = message.guild_id

        this.#countChannel = countChannel
        this.#modeFile = getMode(countChannel.difficulty)

        this.#memberUsername = message.author.display_name?? message.author.username
        this.#memberIcon = message.author.avatar

        this.#channelName = channelName
        this.#guildName = guild.name

        this.#guildIcon = guild.icon

        this.#redis = sharder.redis
    }

    async convertMessage() {
        let msgContent = this.#rawContent.split(" ")[0].replace(/\*\*|~~|__|_|\\/g, "")

        if (this.#modeFile.wordsToNumbersEnabled && this.#countChannel.wordsenabled) msgContent = wordsToNumbers(msgContent)
        if (this.#modeFile.mathEnabled && this.#countChannel.mathenabled) msgContent = await evaluate(msgContent).catch(err=>err)
        if (msgContent === "") return;
        this.value = Number(this.#modeFile.toDecimal(msgContent)?.toFixed(7))
    }

    setCountUser(countUser){
        this.countUser=countUser
    }

    failReason(){
        const diffrence = Number((this.value-this.#countChannel.last_num).toFixed(7));
        this.reason = this.determineReason(diffrence)

        // no fail and solo
        if ((this.reason!=="correct" && this.reason !== "dubbleuser") && this.#countChannel.nofail && this.#countChannel.solo) return this.reason =  "noFailWrong"
        
        // solo
        if (this.#countChannel.solo && this.reason === "dubbleuser" && diffrence === this.#modeFile.diffrence) return this.reason =  "correct"

        // no fail
        if (this.#countChannel.nofail && this.reason!=="correct") return this.reason =  "noFailWrong"

        // use save
        if (this.#countChannel.saves_enabled && (this.reason !== "warning" && this.reason!=="correct" && !this.#countChannel.nofail) && this.#countChannel.last_num!==0 && (this.countUser.saves>=1 || this.#countChannel.saves>=1)) return this.reason =  this.countUser.saves >= 1 ? "usersaved": this.#countChannel.saves >=1 ? "channelsaved" : "wrong"
    }

    determineReason(diffrence){
        //double num
        if (diffrence === 0) return this.#countChannel.enablewarning ? "warning" : "dubblenumber";
        
        //skipped and back in numbers
        if (diffrence > this.#modeFile.diffrence) return "skippednum";
        if (diffrence < this.#modeFile.diffrence) return "baknumber";
        
        //double user
        if (this.#memberid === this.#countChannel.previos_sender) return "dubbleuser";

        // correct
        if (diffrence === this.#modeFile.diffrence) return "correct";
    }

    async exucuteWebhook(){
        this.#redis.set(`selfDel:${this.#messageid}`, 1, "EX", 240)
        const originalID = this.#messageid
        const exucutedHook = await this.#bot.webhooks.execute(this.#countChannel.hook_id, this.#countChannel.hook_token, {content: this.#modeFile.fromDecimal(this.value), avatarURL: `https://cdn.discordapp.com/avatars/${this.#memberid}/${this.#memberIcon}.jpg`, username: this.#memberUsername, wait: true, allowedMentions: {everyone: false, roles: false, users: false}}).catch((err)=>{})
        if (!exucutedHook) return;
        this.#messageid = exucutedHook.id
        this.#bot.channels.deleteMessage(this.#channelid, originalID).catch(()=>{});
    }
    
    async messageReactions(){
        switch(this.reason){
            case "noFailWrong": {
                this.#redis.set(`selfDel:${this.#messageid}`, 1, "EX", 240)
            
                this.#bot.channels.deleteMessage(this.#channelid, this.#messageid).catch(()=>{});
            }
            break;
            case "channelsaved":
            case "usersaved": {
                this.#bot.channels.createReaction(this.#channelid, this.#messageid, "💾").catch(()=>{})
                const saved = this.reason === "channelsaved" ? await pgPool`UPDATE data SET savednumbers = savednumbers+1, saves = saves-1 WHERE channelid = ${this.#channelid} RETURNING saves, max_saves`.catch(()=>{}) : await pgPool`UPDATE users SET saves = saves-1 WHERE userid = ${this.#memberid} RETURNING saves, max_saves`.catch(()=>{})
                const nextNum = this.#modeFile.fromDecimal(this.#countChannel.last_num+this.#modeFile.diffrence)
                this.#bot.channels.createMessage(this.#channelid, {"embeds": [{"title": "Save Used","description":`${this.reason === "channelsaved" ? "Channel save used." : `<@${this.#memberid}> has used a save.`} There are ${saved[0].saves.toFixed(2)}/${saved[0].max_saves} remaining. The next number is: ${typeof nextNum === "number" ? nextNum.toFixed(2) : nextNum}.`,"color": 14680145, }]}).catch(()=>{});
                this.#redis.set(`failCoolDown:${this.#channelid}`, 1, "EX", 3)
            }
            break;
            case "warning": {
                this.#bot.channels.createReaction(this.#channelid, this.#messageid, "⚠️").catch(()=>{});
                this.#bot.channels.createMessage(this.#channelid, {"embeds": [{"title": "Same number counted twice.","description":`The number ${this.value} was sent twice in a row.\nThe next number is: ${this.#modeFile.fromDecimal(this.#countChannel.last_num+this.#modeFile.diffrence)}.`,"color": 14680145, }]}).catch(()=>{});
            }
            break;
            case "correct": {
                const beatHS = this.value > this.#countChannel.hs && !this.#countChannel.nofail;
                const goalReached = this.#countChannel.goal !== 0 && this.#countChannel.goal <= this.value;
        
                pgPool`UPDATE data SET last_num = ${this.value}, previos_sender = ${this.#memberid}, name = ${this.#channelName}, hs = GREATEST(${this.value}, data.hs), hs_user = ${beatHS ? this.#memberid : this.#countChannel.hs_user}, hs_date = ${beatHS ? pgPool`localtimestamp` : this.#countChannel.hs_date}, goal_date = ${goalReached ? '0' : this.#countChannel.goal_date}, goal = ${goalReached ? 0 : this.#countChannel.goal} WHERE channelid = ${this.#channelid}`.catch((error)=>{console.log(error)})
                
                // add correct or hs reaction
                this.#bot.channels.createReaction(this.#channelid, this.#messageid, beatHS ? this.#countChannel.hs_react : this.#countChannel.react).catch(()=>{});
                
                // reward random save
                if (this.value !== 0 && Number(Math.random().toFixed(2)) > 0.97) pgPool`UPDATE users SET saves = saves + 1 WHERE userid = ${this.#memberid} AND saves+1 <= max_saves`.catch(()=>{})
           
                // 100th number reaction
                if (this.value !== 0 && this.value % 100 === 0 && this.#countChannel.difficulty !== 8) this.#bot.channels.createReaction(this.#channelid, this.#messageid, "💯").catch(()=>{});
                
                // reach goal
                if (goalReached) this.#bot.channels.createMessage(this.#channelid, {"embeds": [{"title": "Good Job","description": `<@${this.#memberid}> beat <#${this.#channelid}>'s goal of **${this.#modeFile.fromDecimal(this.#countChannel.goal)}** set <t:${Math.floor(Number(this.#countChannel.goal_date) / 1000)}:R>`,"color": 14680145}]}).catch(()=>{});
        
                // add easter egg reactions
                if (this.#countChannel.egg_enabled){
                    if (this.value === 8675309) return this.#bot.channels.createMessage(this.#channelid, {"embeds": [{"description": "Eight six seven five three oh nine \nI got it (i got it) I got it\nI got your number on the wall\nI got it (i got it) I got it \n[source](https://www.youtube.com/watch?v=Dg_YueZ4fi8)","color": 14680145}]}).catch(()=>{})
                    
                    if (reactions.has(this.value)) reactions.get(this.value).map(reaction=>this.#bot.channels.createReaction(this.#channelid, this.#memberid, reaction).catch(()=>{}))
                    if (modeReactions.has(this.#countChannel.difficulty) && modeReactions.get(this.#countChannel.difficulty).has(this.value)) modeReactions.get(this.#countChannel.difficulty).get(this.value).map(reaction=>this.#bot.channels.createReaction(this.#channelid, this.#memberid, reaction).catch(()=>{}))
                }
            }
            break;
            default:
                this.fail()
            break;
        }
    }

    async fail(){
        this.#bot.channels.createReaction(this.#channelid, this.#messageid, this.#countChannel.wrongreact).catch(()=>{});
                
        if (this.#countChannel.failban) this.#bot.guilds.createBan(this.#guildid, this.#memberid, {reason: "messed up the count"}).catch(err=>{})
        
        pgPool`UPDATE data SET last_num = 0, previos_sender = '', name = ${this.#channelName} WHERE channelid = ${this.#channelid}`.catch(()=>{})
        
        const countChannel = await pgPool`SELECT ${pgPool("failtexts."+this.reason)} AS reason, roleid FROM failtexts LEFT OUTER JOIN failrole ON failtexts.channelid=failrole.channelid WHERE failtexts.channelid = ${this.#channelid}`.catch((err)=>{})

        this.#bot.channels.createMessage(this.#channelid, {"embeds": [{"title": countChannel[0].reason.replace("++one++", this.#modeFile.startingNum), "description": `${this.#countChannel.failban ? "The user was banned for messing up the count.":""}`, "color": 14680145}]}).catch(()=>{});
        
        if (countChannel[0].roleid) {
            this.#bot.guilds.addMemberRole(this.#guildid, this.#memberid, countChannel[0].roleid).catch(err=>{})
        }

        this.#redis.set(`failCoolDown:${this.#channelid}`, 1, "EX", 3)
    }

    async updateLogs(){
        const numberWrong = this.reason === "skippednum" || this.reason === "baknumber" || this.reason === "dubbleuser" || this.reason === "dubblenumber"

        pgPool`INSERT INTO countinglog (channelid, sender, reason, number, date, messageid) VALUES (${this.#channelid}, ${this.#memberid}, ${this.reason}, ${this.value}, now(), ${this.#messageid})`.catch(()=>{})
        pgPool`delete from countinglog t using (with count as (select channelid from countinglog where channelid = ${this.#channelid} group by channelid having count(*) > 9), deleteRow as (SELECT messageid FROM countinglog WHERE channelid = ${this.#channelid} ORDER BY date ASC LIMIT 1) select * from count, deleteRow) t1 where t1.channelid = t.channelid and t.messageid = t1.messageid`.catch(err=>{})

        // update server data
        pgPool`UPDATE serverdata SET name = ${this.#guildName}, icon = ${this.#guildIcon} WHERE serverid = ${this.#guildid}`.catch(()=>{})

        // updateChannelLB
        pgPool`INSERT INTO channellb (userid, channelid, guildid, correctcount, wrongcount, savesused, highestcount) VALUES (${this.#memberid}, ${this.#channelid}, ${this.#guildid}, ${(this.reason==="correct" ? 1 : 0)}, ${(numberWrong ? 1 : 0)}, ${(this.reason==="usersaved" ? 1 : 0)}, ${this.reason==="correct" ? this.value : 0}) ON CONFLICT(userid, channelid) DO UPDATE SET correctcount=channellb.correctcount+${(this.reason==="correct" ? 1 :0)}, wrongcount = channellb.wrongcount+${(numberWrong ? 1 : 0)}, savesused = channellb.savesused+${(this.reason==="usersaved" ? 1 : 0)}, highestcount = GREATEST(${this.reason==="correct" ? this.value : 0}, channellb.highestcount) WHERE channellb.userid = $1 AND channellb.channelid = ${this.#channelid}`.catch(()=>{})
        pgPool`INSERT INTO mothlychannellb (userid, channelid, guildid, correctcount, wrongcount, savesused, highestcount) VALUES (${this.#memberid}, ${this.#channelid}, ${this.#guildid}, ${(this.reason==="correct" ? 1 : 0)}, ${(numberWrong ? 1 : 0)}, ${(this.reason==="usersaved" ? 1 : 0)}, ${this.reason==="correct" ? this.value : 0}) ON CONFLICT(userid, channelid) DO UPDATE SET correctcount=mothlychannellb.correctcount+${(this.reason==="correct" ? 1 :0)}, wrongcount = mothlychannellb.wrongcount+${(numberWrong ? 1 : 0)}, savesused = mothlychannellb.savesused+${(this.reason==="usersaved" ? 1 : 0)}, highestcount = GREATEST(${this.reason==="correct" ? this.value : 0}, mothlychannellb.highestcount) WHERE mothlychannellb.userid = $1 AND mothlychannellb.channelid = ${this.#channelid}`.catch(()=>{})
    }
}
