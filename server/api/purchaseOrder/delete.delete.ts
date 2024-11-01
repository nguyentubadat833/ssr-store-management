import {IPurchaseOrderParamsSelectReq} from "~/types/IPurchaseOrder";
import purchaseOrderError from "~/server/utils/error/purchaseOrderError";
import {getResponseMessageKey, responseMessage} from "~/types/IResponse";

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsSelectReq = getQuery(event)
    const status = await prismaClient.purchaseOrder.findUniqueOrThrow({
        where: {
            code: params.poCode
        }
    }).then(data => {
        return data.status
    }).catch(e => {
        handlerError(e, event)
    })
    switch (status) {
        case 0:
            return prismaClient.purchaseOrder.delete({
                where: {
                    code: params.poCode
                },
                select: {
                    code: true
                }
            }).then(data => {
                return data.code
            })
        case 1:
            throw createError({
                statusCode: 400,
                statusText: getResponseMessageKey(responseMessage.purchaseOrderOrdered)
            })
        case 2:
            throw createError({
                statusCode: 400,
                statusText: getResponseMessageKey(responseMessage.purchaseOrderOrderedAndStockEntered)
            })
    }
})