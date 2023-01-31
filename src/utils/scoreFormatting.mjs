/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
export default (index, name, number) => {
    const srtNumber = number.toString();
    const trimedNumber = (srtNumber.includes(".") ? `${srtNumber.split(".")[0]}.${srtNumber.split(".")[1].slice(0, 2)}` : srtNumber)

    return `**#${index+1}** ${name}, **${trimedNumber.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${srtNumber.includes(".")?".":""}${trimedNumber.split(".")[1]??""}**`;
}