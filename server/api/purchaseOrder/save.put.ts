import {IPurchaseOrderDetail, IPurchaseOrderParamsSaveReq, IPurchaseOrderReq} from "~/types/IPurchaseOrder";
import randomstring from "randomstring";
import {Prisma} from "@prisma/client";
import {getResponseMessageKey, responseMessage} from "~/types/IResponse";

export default defineEventHandler(async (event) => {
    const params: IPurchaseOrderParamsSaveReq = getQuery(event)
    const body: IPurchaseOrderReq = await readBody(event)
    const {type, poCode} = params
    if (type === 'save') {
        const details = body?.details?.filter(e => !('status' in e) || e.status === 1)
            .map(e => {
                if (!e.quantity || (e.quantity > 0 && !e.totalAmount)) {
                    throw createError({
                        statusCode: 400,
                        statusText: getResponseMessageKey(responseMessage.invalidQuantityAndTotalAmount)
                    })
                }
                return {
                    ...e,
                    status: 1
                }
            }) as unknown as Prisma.JsonObject
        if (!(poCode)) {
            return prismaClient.purchaseOrder.create({
                data: {
                    code: 'PO' + randomstring.generate({
                        length: 10,
                        charset: 'numeric'
                    }),
                    supplierCode: body.supplierCode,
                    description: body.description,
                    createdBy: userAuthContext.getEmail(event),
                    details: details
                },
                select: {
                    code: true,
                    supplierCode: true,
                    description: true,
                    status: true,
                    details: true
                }
            });
        } else {
            return prismaClient.purchaseOrder.update({
                where: {
                    code: poCode
                },
                data: {
                    supplierCode: body.supplierCode,
                    description: body.description,
                    details: details,
                    lastUpdatedBy: userAuthContext.getEmail(event),
                    lastUpdatedAt: new Date()
                }
            })
        }
    } else {
        const status = await prismaClient.purchaseOrder.findUniqueOrThrow({
            where: {
                code: poCode
            },
            select: {
                status: true
            }
        }).then((data) => {
            return data.status
        }).catch(e => {
            handlerError(e, event)
        })
        switch (type) {
            case "cancel":
                switch (status) {
                    case 0:
                        setResponseStatus(event, 204, getResponseMessageKey(responseMessage.purchaseOrderPending))
                        break
                    case 1:
                        const data = await prismaClient.purchaseOrder.findUniqueOrThrow({
                            where: {
                                code: poCode
                            },
                            select: {
                                receiving: true
                            }
                        }).then(data => {
                            return data.receiving
                        }).catch(e => {
                            handlerError(e, event)
                        })

                        if (Array.isArray(data) && data.length > 0) {
                            throw createError({
                                statusCode: 400,
                                statusText: getResponseMessageKey(responseMessage.purchaseOrderToLinkReceiving)
                            })
                        } else {
                            await prismaClient.purchaseOrder.update({
                                where: {
                                    code: poCode
                                },
                                data: {
                                    status: 0
                                }
                            })
                            break
                        }
                    case 2:
                        throw createError({
                            statusCode: 400,
                            statusText: getResponseMessageKey(responseMessage.purchaseOrderOrderedAndStockEntered)
                        })
                }
                break
            case "confirm":
                switch (status) {
                    case 0:
                        const data = await prismaClient.purchaseOrder.findUniqueOrThrow({
                            where: {code: poCode},
                            select: {details: true}
                        }).catch(e => {
                            handlerError(e, event)
                        })
                        const details = data?.details as unknown as IPurchaseOrderDetail[];
                        if (details) {
                            const validDetails = details.some(e => e.status === 1)
                            if (validDetails) {
                                await prismaClient.purchaseOrder.update({
                                    where: {
                                        code: poCode
                                    },
                                    data: {
                                        status: 1,
                                        orderDate: new Date()
                                    }
                                })
                                break
                            }
                        }
                        throw createError({
                            statusCode: 400,
                            statusText: getResponseMessageKey(responseMessage.purchaseOrderNoProduct)
                        })
                    case 1:
                        setResponseStatus(event, 204, getResponseMessageKey(responseMessage.purchaseOrderOrdered))
                        break
                    case 2:
                        throw createError({
                            statusCode: 400,
                            statusText: getResponseMessageKey(responseMessage.purchaseOrderOrderedAndStockEntered)
                        })
                }
                break
        }

    }
})