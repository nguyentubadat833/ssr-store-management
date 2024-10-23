import {IPurchaseOrderParamsSelectReq} from "~/types/IPurchaseOrder";

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsSelectReq = getQuery(event)
    const {selectType} = params
    const selectField = {
        code: true,
        supplierCode: true,
        status: true,
        details: true,
        orderDate: true,
        dateOfReceipt: true,
    }
    switch (selectType) {
        case "many":
            return prismaClient.purchaseOrder.findMany({
                select: selectField,
            })
    }
})