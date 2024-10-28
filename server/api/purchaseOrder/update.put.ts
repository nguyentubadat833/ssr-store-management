import {
    IPurchaseOrderDetailUpdate,
    type IPurchaseOrderDto,
    IPurchaseOrderParamsUpdateReq
} from "~/types/IPurchaseOrder";
import _ from 'lodash'
import purchaseOrderError from "~/server/utils/error/purchaseOrderError";

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsUpdateReq = getQuery(event)
    const body: IPurchaseOrderDto = await readBody(event)
    const {updateType, poCode} = params
    const poStatus = await prismaClient.purchaseOrder.findUniqueOrThrow({
        where: {
            code: poCode
        },
        select: {
            status: true
        }
    }).then(response => {
        return response.status
    })
        .catch(e => {
            return handlerError(e, event)
        })
    switch (updateType) {
        case "confirm":
            if (poStatus === 1) {
                return purchaseOrderError.ordered(event)
            } else {
                await prismaClient.purchaseOrder.update({
                    where: {
                        code: poCode
                    },
                    data: {
                        status: 1,
                        orderDate: new Date()
                    }
                })
                setResponseStatus(event, 200, 'Confirmed successfully')
                break
            }
        case "cancel":
            await prismaClient.purchaseOrder.update({
                where: {
                    code: poCode
                },
                data: {
                    status: 0,
                    orderDate: null
                }
            })
            setResponseStatus(event, 200, 'Canceled successfully')
            break
        case "update":
            const {code, supplierCode, description, details} = body
            if (poStatus === 0) {
                await prismaClient.purchaseOrder.update({
                    where: {
                        code: code
                    },
                    data: {
                        supplierCode: supplierCode,
                        description: description
                    }
                })
                const {toCreate, toUpdate, toDelete} = details as IPurchaseOrderDetailUpdate
                if (_.isArray(toCreate) && toCreate.length > 0) {
                    await prismaClient.purchaseOrderDetail.createMany({
                        data: toCreate
                    })
                }
                if (_.isArray(toUpdate) && toUpdate.length > 0) {
                    for (const poDetail of toUpdate) {
                        await prismaClient.purchaseOrderDetail.update({
                            where: {
                                id: poDetail.id
                            },
                            data: {
                                poCode: poDetail.poCode,
                                productCode: poDetail.productCode,
                                quantity: poDetail.quantity || 0,
                                unitPrice: poDetail.unitPrice,
                                totalAmount: poDetail.totalAmount
                            }
                        })
                    }
                }
                if (_.isArray(toDelete) && toDelete.length > 0) {
                    await prismaClient.purchaseOrderDetail.deleteMany({
                        where: {
                            id: {
                                in: toDelete
                            }
                        }
                    })
                }
                setResponseStatus(event, 200, 'Updated successfully')
                break
            } else {
                return purchaseOrderError.ordered(event)
            }

    }
})