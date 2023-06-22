/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
export const formatScoreString = (index, name, number) => `**#${index+1}** ${name}, **${number}**`

export const formatChannelString = (array, mode) => {
    return (array.map((item, index)=> {
        const number = mode.fromDecimal(item.number)
        return formatScoreString(index, item.name, isNaN(number) ? number : Number(number).toLocaleString())
    })).join("\n")
}