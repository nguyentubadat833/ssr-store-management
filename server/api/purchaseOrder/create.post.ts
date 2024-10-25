import randomstring from "randomstring";
import _ from 'lodash'
import {type IPurchaseOrderDetail, IPurchaseOrderDto} from "~/types/IPurchaseOrder";

export default defineEventHandler(async (event) => {
    const data: IPurchaseOrderDto = await readBody(event)
    const details = data.details as IPurchaseOrderDetail[]
    const response = await prismaClient.purchaseOrder.create({
        data: {
            code: 'PO' + randomstring.generate({
                length: 10,
                charset: 'numeric'
            }),
            supplierCode: data.supplierCode,
            description: data.description,
            createdBy: userAuthContext.getEmail(event),
            details: {
                create: _.isArray(details) && details.length > 0 ? details : undefined
            }
        }
    })
    setResponseStatus(event, 201)
    return response.code
})