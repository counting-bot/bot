/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
import {Interaction} from 'oceanic.js'

export default async (packet, sharder)=>{
    const interactionObj = Interaction.from(packet, sharder)

    if (packet.type === 3) return sharder.emit("componentInteract", interactionObj)
    
    if (!sharder.commands.has(packet.data.name)) return interactionObj.createMessage({"flags":64, "embeds": [{"title": "There was an error finding that command","color": 14680145}]}).catch(()=>{});
    sharder.commands.get(packet.data.name).commandFile.commandLogic(interactionObj, sharder)
}