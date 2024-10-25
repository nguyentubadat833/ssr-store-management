import {IReceivingParamsSelectReq} from "~/types/IReceiving";

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsSelectReq = getQuery(event)
    const {selectType, receivingCode} = params
    switch (selectType) {
        case "many":
            return prismaClient.receiving.findMany();
        case "byCode":
            return prismaClient.receiving.findUniqueOrThrow({
                where: {
                    code: receivingCode
                }
            }).catch(error => {
                return handlerError(error, event)
            })
    }
})