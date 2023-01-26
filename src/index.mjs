/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import {Client} from 'oceanic.js'
import { readdir } from 'fs/promises'
import { schedule } from 'node-cron';
import packet from './events/packet.mjs';
import { token } from '/static/settings.mjs';
import pgPool from './utils/db.mjs'

const client = new Client({
	auth: token,
	collectionLimits: {
		messages: 3
	},
	gateway:{
		intents: [
			"GUILDS",
			"GUILD_MESSAGES",
			"MESSAGE_CONTENT"
		]
	}
});

client.once("ready", async() => {
	const discordCommands = await client.application.getGlobalCommands()
	client.commands = new Map(
		await Promise.all((await readdir("./slashCommands/")).map(async registerdCommand => {
			const name = registerdCommand.split(".")[0]
			if (discordCommands.length === 0){
				return [name, {commandFile: await import(`./slashCommands/${registerdCommand}`)}]
			}else{
				return [name, {commandFile: await import(`./slashCommands/${registerdCommand}`), discordInfo: discordCommands.find(command=>{return command.name === name})}]
			}
		}))
	)

	if (discordCommands.length === 0) {
		const localCommands = Array.from(client.commands.keys()).map(name => {
			const {options, description} = client.commands.get(name).commandFile
			return {name, options, description}
		})

		const remoteCommands = await client.application.bulkEditGlobalCommands(localCommands)
		Array.from(client.commands.keys()).map(cmd=>{
			client.commands.set(cmd, {...client.commands.get(cmd), discordInfo: remoteCommands.find(command=>{return command.name === cmd})})
		})
	}
})

client.on("ready", async() => {
	client.editStatus("dnd", [{ name: "/help", type: 0}]);
})


client.on('log', m => console.log(m));
client.on('error', m => console.error(m));
client.on('warn', m => console.warn(m));

client.on("packet", packet.bind(null, client))

schedule('0 0 1 * *', async () => {
	pgPool`DELETE FROM mothlychannellb`.catch(err=>{});
})

client.connect();