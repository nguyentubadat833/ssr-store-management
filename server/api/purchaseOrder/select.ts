import {
    type IPurchaseOrderDetail,
    IPurchaseOrderParamsSelectReq, type IPurchaseOrderRes
} from "~/types/IPurchaseOrder";
import {ISupplierInfo} from "~/types/ISupplier";

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsSelectReq = getQuery(event)
    const {selectType, poCode} = params
    const selectField = {
        code: true,
        supplierCode: true,
        description: true,
        status: true,
        // details: true,
        orderDate: true,
        dateOfReceipt: true,
    }
    switch (selectType) {
        case "many":
            return prismaClient.purchaseOrder.findMany({
                select: {
                    ...selectField,
                    details: true
                },
            })
        case "byCode":
            return prismaClient.purchaseOrder.findUnique({
                where: {
                    code: poCode
                },
                select: {
                    ...selectField,
                    details: true
                },
            })
        case "manyOrdered":
            const response = await prismaClient.purchaseOrder.findMany({
                where: {
                    status: {
                        in: [1, 2]
                    }
                },
                select: {
                    code: true,
                    description: true,
                    supplier: {
                        select: {
                            code: true,
                            info: true
                        }
                    },
                    details: true,
                    orderDate: true
                }
            })
            if (response) {
                return await Promise.all(response.map(async e => {
                    const products = await prismaClient.product.findMany({
                        where: {
                            code: {
                                in: (e.details as unknown as IPurchaseOrderDetail[]).map(e => {
                                    return e.productCode
                                })
                            }
                        },
                        select: {
                            name: true,
                            code: true
                        }
                    })
                    return {
                        code: e.code,
                        supplierCode: e.supplier.code,
                        supplierName: (e.supplier.info as ISupplierInfo | null)?.name,
                        description: e.description,
                        details: (e.details as unknown as IPurchaseOrderDetail[]).map(e => {
                            return {
                                quantity: e.quantity,
                                productCode: e.productCode,
                                productName: products.find(p => p.code === e.productCode)?.name
                            } as IPurchaseOrderDetail
                        }),
                        orderDate: e.orderDate,
                    } as IPurchaseOrderRes
                }))
            }
    }
})