/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
export default {
    name: "rules",
    commandLogic: async (interaction, sharder) => {
        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"title": "Counting Rules","description": "1) No skipping numbers\n2) No going back in numbers\n3) Must alternate counters (except for solo mode)\n4) No botting, scripting or abusing bugs\n5) Do not intentionally ruin the count","color": 14680145}]}}).catch(()=>{});
    },
    description: "Shows rules for counting",
    category: "General"
}