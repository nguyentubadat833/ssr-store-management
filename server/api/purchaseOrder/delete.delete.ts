import {IPurchaseOrderParamsSelectReq} from "~/types/IPurchaseOrder";
import purchaseOrderError from "~/server/utils/error/purchaseOrderError";

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsSelectReq = getQuery(event)
    try {
        const data = await prismaClient.purchaseOrder.findUniqueOrThrow({
            where: {
                code: params.poCode
            }
        })
        const status = data.status
        if (status === 0) {
            await prismaClient.purchaseOrderDetail.deleteMany({
                where: {
                    poCode: params.poCode
                }
            })
            await prismaClient.purchaseOrder.delete({
                where: {
                    code: params.poCode
                },
            })
            setResponseStatus(event, 204)
        } else {
            return purchaseOrderError.ordered(event)
        }
    } catch (error) {
        return handlerError(error, event)
    }
})