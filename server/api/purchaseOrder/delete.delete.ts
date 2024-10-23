import {IPurchaseOrderParamsSelectReq} from "~/types/IPurchaseOrder";

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsSelectReq = getQuery(event)
    await prismaClient.purchaseOrder.delete({
        where: {
            code: params.poCode
        },
    }).then(() => {
        setResponseStatus(event, 204)
    })
})