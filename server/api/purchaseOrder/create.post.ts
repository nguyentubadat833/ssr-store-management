import randomstring from "randomstring";
import _ from 'lodash'
import {IPurchaseOrderDto} from "~/types/IPurchaseOrder";

export default defineEventHandler(async (event) => {
    const data: IPurchaseOrderDto = await readBody(event)
    const response = await prismaClient.purchaseOrder.create({
        data: {
            code: 'PO' + randomstring.generate({
                length: 10,
                charset: 'numeric'
            }),
            supplierCode: data.supplierCode,
            createdBy: userAuthContext.getEmail(event),
            details: {
                create: _.isArray(data.details) && data.details.length > 0 ? data.details : undefined
            }
        }
    })
    setResponseStatus(event, 201)
    return response.code
})