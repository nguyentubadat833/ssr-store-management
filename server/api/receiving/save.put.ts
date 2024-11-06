import {getResponseMessageKey, responseMessage} from "~/types/IResponse";
import randomstring from "randomstring";
import {EventHandlerRequest, H3Event} from "h3";
import {IReceivingParamsSaveReq, IReceivingReq} from "~/types/IReceiving";

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsSaveReq = getQuery(event)
    const {type, receivingCode, stockId} = params
    const body: IReceivingReq = await readBody(event)
    if (type === 'save') {
        const {code, stocks: stocksReq} = body
        const isNonSelectWarehouse = stocksReq?.some(e => e.inQuantity && e.inQuantity > 0 && !e.warehouseCode)
        if (isNonSelectWarehouse) {
            receivingError.invalidWarehouse()
        }
        const isProgress = stocksReq?.some(e => {
            return e.inQuantity && e.inQuantity > 0
        })
        if (code) {
            const status = await getReceivingStatus(code, event)
            if (status === 2) {
                receivingError.complete()
            } else {
                return prismaClient.receiving.update({
                    where: {
                        code: code
                    },
                    data: {
                        status: isProgress ? 1 : 0,
                        stocks: {
                            update: stocksReq?.filter(e => e.id)
                                .map(e => {
                                    return {
                                        where: {
                                            id: e.id
                                        },
                                        data: {
                                            inQuantity: e.inQuantity,
                                            productCode: e.productCode,
                                            warehouseCode: e.warehouseCode,
                                            lastUpdatedBy: userAuthContext.getEmail(event),
                                            lastUpdatedAt: new Date()
                                        }
                                    }
                                }) || [],
                            create: stocksReq?.filter(e => !e.id)
                                .map(e => {
                                    return {
                                        inQuantity: e.inQuantity,
                                        productCode: e.productCode,
                                        warehouseCode: e.warehouseCode,
                                        createdBy: userAuthContext.getEmail(event)
                                    }
                                }) || []
                        }
                    },
                    select: {
                        code: true
                    }
                }).then(data => {
                    return data.code
                })
            }
        } else {
            const response = await prismaClient.receiving.create({
                data: {
                    code: 'RCV' + randomstring.generate({
                        length: 10,
                        charset: 'numeric'
                    }),
                    poCode: body.poCode,
                    status: isProgress ? 1 : 0,
                    createdBy: userAuthContext.getEmail(event),
                    stocks: {
                        createMany: {
                            data: stocksReq?.map(e => {
                                return {
                                    inQuantity: e.inQuantity,
                                    productCode: e.productCode,
                                    warehouseCode: e.warehouseCode,
                                    createdBy: userAuthContext.getEmail(event)
                                }
                            }) || []
                        }
                    }
                },
                include: {
                    po: {
                        select: {
                            status: true
                        }
                    }
                }
            })
            if (response.po.status === 1) {
                await prismaClient.purchaseOrder.update({
                    where: {
                        code: body.poCode,
                    },
                    data: {
                        status: 2
                    }
                })
            }
            return response.code
        }
    } else {
        if (receivingCode) {
            const status = await getReceivingStatus(receivingCode, event)
            switch (type) {
                case "cancel":
                    switch (status) {
                        case 1:
                            await setCancel(receivingCode)
                            setResponseStatus(event, 204, getResponseMessageKey(responseMessage.successfullyCanceled))
                            break
                        case 2:
                            const isOutStock = await prismaClient.stock.findMany({
                                where: {
                                    receivingCode: receivingCode
                                }
                            }).then(data => {
                                return data.some(e => e.inQuantity === e.outQuantity)
                            })
                            if (isOutStock) {
                                receivingError.dispatch()
                            } else {
                                await setCancel(receivingCode)
                                setResponseStatus(event, 204, getResponseMessageKey(responseMessage.successfullyCanceled))
                            }
                            break
                    }
                    break
                case "imported":
                    switch (status) {
                        case 0:
                            receivingError.pending()
                        case 1:
                            try {
                                await setImported(receivingCode)
                                setResponseStatus(event, 204, getResponseMessageKey(responseMessage.receivingComplete))
                            } catch (e) {
                                return handlerError(e, event)
                            }
                            break
                        case 3:
                            setResponseStatus(event, 204, getResponseMessageKey(responseMessage.receivingComplete))
                            break
                    }
                    break
                case "deleteStock":
                    if (stockId) {

                    } else {

                    }
                    break
            }
        }
    }
})

async function setCancel(receivingCode: string) {
    await prismaClient.receiving.update({
        where: {
            code: receivingCode
        },
        data: {
            status: 0,
            receivedDate: null,
            stocks: {
                updateMany: {
                    where: {},
                    data: {
                        inQuantity: 0
                    }
                }
            }
        },
    })
}

async function setImported(receivingCode: string) {
    await prismaClient.receiving.update({
        where: {
            code: receivingCode
        },
        data: {
            receivedDate: new Date(),
            status: 2
        },
        select: {
            status: true
        }
    })
}

export async function getReceivingStatus(code: string, event: H3Event<EventHandlerRequest>) {
    return prismaClient.receiving.findUnique({
        where: {
            code: code
        },
        select: {
            status: true
        }
    }).then(data => {
        return data?.status
    }).catch(e => {
        return handlerError(e, event)
    })
}
