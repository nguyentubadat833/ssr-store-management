import {
    IPurchaseOrderDetailUpdate,
    type IPurchaseOrderDto,
    IPurchaseOrderParamsUpdateReq
} from "~/types/IPurchaseOrder";
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsUpdateReq = getQuery(event)
    const body: IPurchaseOrderDto = await readBody(event)
    const {updateType, poCode} = params
    switch (updateType) {
        case "confirm":
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
        case "cancel":
            await prismaClient.purchaseOrder.update({
                where: {
                    code: poCode
                },
                data: {
                    status: 0
                }
            })
            setResponseStatus(event, 200, 'Canceled successfully')
            break
        case "update":
            const {code, supplierCode, details} = body
            await prismaClient.purchaseOrder.update({
                where: {
                    code: code
                },
                data: {
                    supplierCode: supplierCode,
                }
            })
            const {toCreate, toUpdate, toDelete} = details as IPurchaseOrderDetailUpdate
            if (_.isArray(toCreate) && toCreate.length > 0){
                await prismaClient.purchaseOrderDetail.createMany({
                    data: toCreate
                })
            }
            if (_.isArray(toUpdate) && toUpdate.length > 0){
                for (const poDetail of toUpdate) {
                    await prismaClient.purchaseOrderDetail.update({
                        where: {
                            id: poDetail.id
                        },
                        data: {
                            poCode: poDetail.poCode,
                            productCode: poDetail.productCode,
                            quantity: poDetail.quantity,
                            unitPrice: poDetail.unitPrice,
                            totalAmount: poDetail.totalAmount
                        }
                    })
                }
            }
            if (_.isArray(toDelete) && toDelete.length > 0){
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
    }
})