import {IReceivingParamsSelectReq} from "~/types/IReceiving";

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsSelectReq = getQuery(event)
    const {selectType, receivingCode} = params
    const selectField = {
        id: true,
        code: true,
        poCode: true,
        status: true,
        receivedDate: true,
        stocks: true,
    }
    switch (selectType) {
        case "many":
            return prismaClient.receiving.findMany({
                select: selectField
            });
        case "byCode":
            return prismaClient.receiving.findUniqueOrThrow({
                where: {
                    code: receivingCode
                },
                select: selectField
            }).catch(error => {
                return handlerError(error, event)
            })
    }
})