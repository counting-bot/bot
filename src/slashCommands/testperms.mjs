/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
export const commandLogic = async (interaction, sharder) => {
    await interaction.defer();

    const channelPermissions = interaction.channel.permissionsOf(sharder.user.id), rolePermissions = interaction.member.guild.members.get(sharder.user.id).permissions

    const permReport = `**Permissions Report**\n\n__Channel Permissions__\nSend Message: ${channelPermissions.has("SEND_MESSAGES") ? "🟢" : "🔴"}\nEmbed Links: ${channelPermissions.has("EMBED_LINKS") ? "🟢" : "🔴"}\nRead Message History: ${channelPermissions.has("READ_MESSAGE_HISTORY")  ? "🟢" : "🔴"}\nAdd Reactions: ${channelPermissions.has("ADD_REACTIONS") ? "🟢" : "🔴"}\nUse External Emojis: ${channelPermissions.has("USE_EXTERNAL_EMOJIS") ? "🟢" : "🔴"}\nManage Webhooks: ${channelPermissions.has("MANAGE_WEBHOOKS") ? "🟢" : "🔴"}\n\n__Role Permissions__\nAdd Reactions: ${rolePermissions.has("ADD_REACTIONS") ? "🟢" : "🔴"}\nUse External Emojis: ${rolePermissions.has("USE_EXTERNAL_EMOJIS") ? "🟢" : "🔴"}\nRead Message History: ${rolePermissions.has("READ_MESSAGE_HISTORY")  ? "🟢" : "🔴"}\nSend Messages: ${rolePermissions.has("SEND_MESSAGES") ? "🟢" : "🔴"}\nManage Webhooks: ${rolePermissions.has("MANAGE_WEBHOOKS") ? "🟢" : "🔴"}\nManage Messages: ${rolePermissions.has("MANAGE_MESSAGES") ? "🟢" : "🔴"}\nBan Members: ${rolePermissions.has("BAN_MEMBERS") ? "🟢" : "🔴"}\nAdmin: ${rolePermissions.has("ADMINISTRATOR") ? "🟢" : "🔴"} (**DO NOT GIVE ME ADMIN I DO NOT NEED IT**)`

    interaction.editOriginal({content:`${permReport}\n\nA copy of this will be sent to you though DM's`}).catch(()=>{});

    const dmChannel = await interaction.user.createDM();
    dmChannel.createMessage({content:permReport}).catch(()=>{});
}

export const description = "Shows if the bot has the required permissions"

export const category = "Info" 