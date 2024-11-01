import {IReceivingDeleteReq} from "~/types/IReceiving";
import purchaseOrderError from "~/server/utils/error/purchaseOrderError";
import receivingError from "~/server/utils/error/receivingError";
import {getResponseMessageKey, responseMessage} from "~/types/IResponse";

export default defineEventHandler(async (event) => {
    const params: IReceivingDeleteReq = getQuery(event)
    const status = await prismaClient.receiving.findUniqueOrThrow({
        where: {
            code: params.receivingCode
        },
        select: {
            status: true
        }
    })
        .then(result => {
            return result.status
        })
        .catch((error) => {
            return handlerError(error, event)
        })
    if (status === 2) {
        throw createError({
            statusCode: 400,
            statusText: getResponseMessageKey(responseMessage.receivingComplete)
        })
    } else {
        await prismaClient.receiving.delete({
            where: {
                code: params.receivingCode
            }
        })
        setResponseStatus(event, 204)
    }
})