/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import { evaluate } from 'expr-eval'

export const commandLogic = async (interaction) => {
    const solvedMath = await evaluate(interaction.data.options.raw[0].value).catch(err=>err)
    
    interaction.createMessage({"embeds": [{"description": `\`\`\`${interaction.data.options.raw[0].value} = ${solvedMath}\`\`\``, "color": 14680145}]}).catch(()=>{});
}

export const description = "Calculate math"

export const category = "Info" 

export const options = [
    {
        "name": "math",
        "description": "The math expression to solve.",
        "type": 3,
        "required": true,
    }
]