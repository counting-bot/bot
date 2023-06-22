/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
const formatTime = (ms) => {
    const days = (Math.floor(ms/ (1000 * 60 * 60 * 24))).toFixed(0)
    const hours = (Math.floor((ms% (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).toFixed(0)
    const minutes = (Math.floor((ms% (1000 * 60 * 60)) / (1000 * 60))).toFixed(0)
    const seconds = (Math.floor((ms% (1000 * 60)) / 1000)).toFixed(0)

    return `${days} Day(s) ${hours}:${minutes}:${seconds}`
}

export default {
    name: "info",
    commandLogic: async (interaction, sharder) => {
        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds":[{"title":"Info", "color":14680145, "description":`**Current shard**: ${interaction.shard} of cluster ${sharder.cluster.id}\n**Shard uptime: **${formatTime(sharder.uptime)}\n[Full stats avalable here](https://counting.numselli.xyz/stats/public-dashboards/028be690534b40638e16e183f91ea524)`}],"components": [{"type": 1, "components": [
            {
              type: 2,
              style: 5,
              label: 'Website',
              url: 'https://counting.numselli.xyz'
            },
            {
              type: 2,
              style: 5,
              label: 'Bot statistics',
              url: 'https://counting.numselli.xyz/stats/public-dashboards/028be690534b40638e16e183f91ea524'
            },
            {
              type: 2,
              style: 5,
              label: 'Support',
              url: 'https://discord.gg/cz5ECsdPBT'
            }
          ]}]}}).catch(()=>{});
    },
    description: "Shows information about the bot such as uptime and ping",
    category: "Info"
}