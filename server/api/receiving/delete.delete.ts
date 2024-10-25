import {IReceivingDeleteReq} from "~/types/IReceiving";

export default defineEventHandler(async (event) => {
    const prams: IReceivingDeleteReq = getQuery(event)


})