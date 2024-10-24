import {IPurchaseOrderParamsSelectReq} from "~/types/IPurchaseOrder";

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
            return handlerError({isError: true, message: 'Đơn hàng đang tiến hành'}, event)
        }
    } catch (error) {
        return handlerError(error, event)
    }
})