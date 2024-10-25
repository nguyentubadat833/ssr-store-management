import {IReceivingDeleteReq} from "~/types/IReceiving";
import purchaseOrderError from "~/server/utils/error/purchaseOrderError";
import receivingError from "~/server/utils/error/receivingError";

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
        return receivingError.imported(event)
    } else {
        await prismaClient.stock.deleteMany({
            where: {
                receivingCode: params.receivingCode
            }
        })
        await prismaClient.receiving.delete({
            where: {
                code: params.receivingCode
            }
        })
        setResponseStatus(event, 204)
    }
})