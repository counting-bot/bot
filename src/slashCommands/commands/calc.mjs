/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import { evaluate } from 'expr-eval'

export default {
    name: "calc",
    commandLogic: async (interaction, sharder) => {
        const solvedMath = await evaluate(interaction.data.options[0].value).catch(err=>err)
        
        sharder.rest.interactions.createInteractionResponse(interaction.id, interaction.token, { type: 4, data: {"embeds": [{"description": `\`\`\`${interaction.data.options[0].value} = ${solvedMath}\`\`\``, "color": 14680145}]}}).catch(()=>{});
    },
    description: "Calculate math",
    category: "Info",
    options: [
        {
            "name": "math",
            "description": "The math expression to solve.",
            "type": 3,
            "required": true,
        }
    ]
}