import {IReceivingDeleteReq} from "~/types/IReceiving";
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
        const deleteResponse = await prismaClient.receiving.delete({
            where: {
                code: params.receivingCode
            },
            select: {
                code: true,
                poCode: true
            }
        })

        const countPO = await prismaClient.receiving.count({
            where: {
                poCode: deleteResponse.poCode
            }
        })
        if (!countPO) {
            await prismaClient.purchaseOrder.update({
                where: {
                    code: deleteResponse.poCode
                },
                data: {
                    status: 1
                }
            })
        }
        return deleteResponse.code
    }
})