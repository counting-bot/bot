import numberCreated from "../countingLogic/numberCreated.mjs"
import numberDeleted from "../countingLogic/numberDeleted.mjs";
import interactionCreate from "../otherLogic/interactionCreate.mjs";

export default async (ipc, packet)=>{
    switch(packet.t){
        case "MESSAGE_CREATE": {
            numberCreated(packet.d, ipc)
        }
        break;
        case "MESSAGE_DELETE": {
            numberDeleted(packet.d, ipc)
        }
        break;
        case "INTERACTION_CREATE": {
            interactionCreate(packet.d, ipc)
        }
        break;
    }
}