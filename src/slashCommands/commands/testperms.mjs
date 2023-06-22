/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import {Permission} from 'oceanic.js'

export default {
    name: "testperms",
    commandLogic: async (interaction, sharder) => {
        const rolePermissions = new Permission(interaction.app_permissions)

        const permReport = `**Permissions Report**\n\n__Channel Permissions__\nAdd Reactions: ${rolePermissions.has("ADD_REACTIONS") ? "🟢" : "🔴"}\nUse External Emojis: ${rolePermissions.has("USE_EXTERNAL_EMOJIS") ? "🟢" : "🔴"}\nRead Message History: ${rolePermissions.has("READ_MESSAGE_HISTORY")  ? "🟢" : "🔴"}\nSend Messages: ${rolePermissions.has("SEND_MESSAGES") ? "🟢" : "🔴"}\nManage Webhooks: ${rolePermissions.has("MANAGE_WEBHOOKS") ? "🟢" : "🔴"}\nManage Messages: ${rolePermissions.has("MANAGE_MESSAGES") ? "🟢" : "🔴"}\nBan Members: ${rolePermissions.has("BAN_MEMBERS") ? "🟢" : "🔴"}\nAdmin: ${rolePermissions.has("ADMINISTRATOR") ? "🟢" : "🔴"} (**DO NOT GIVE ME ADMIN I DO NOT NEED IT**)`

        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {content:permReport}}).catch(()=>{});
    },
    description: "Shows if the bot has the required permissions",
    category: "Info"
}