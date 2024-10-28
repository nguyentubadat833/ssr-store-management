import {
    IPurchaseOrderDetailUseReceiving,
    IPurchaseOrderDto,
    IPurchaseOrderParamsSelectReq
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
            return prismaClient.purchaseOrder.findMany({
                where: {
                    status: 1
                },
                include: {
                    supplier: {
                        select: {
                            info: true
                        }
                    },
                    details: {
                        include: {
                            product: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }).then((response) => {
                return response.map(e => {
                    return {
                        code: e.code,
                        supplierCode: e.supplierCode,
                        description: e.description,
                        status: e.status,
                        details: e.details.map(e => {
                            return {
                                productCode: e.productCode,
                                productName: e.product.name,
                                quantity: e.quantity,
                            } as IPurchaseOrderDetailUseReceiving
                        }),
                        orderDate: e.orderDate,
                        dateOfReceipt: e.dateOfReceipt,
                        supplierName: (e.supplier.info as ISupplierInfo | null)?.name
                    } as IPurchaseOrderDto
                })
            })
    }
})