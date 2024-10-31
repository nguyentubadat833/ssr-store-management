import {IReceivingDto, type IReceivingParamsUpdateReq} from "~/types/IReceiving";
import receivingError from "~/server/utils/error/receivingError";
import {IResponseErrorObject} from "~/types/IResponse";
import randomstring from "randomstring";
import {EventHandlerRequest, H3Event} from "h3";

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsUpdateReq = getQuery(event)
    const {updateType, receivingCode} = params
    if (updateType === 'save') {
        const body: IReceivingDto = await readBody(event)
        const {code, stocks: stocksReq} = body
        const isProgress = stocksReq.some(e => e.inQuantity && e.inQuantity > 0)
        if (code) {
            const status = await getReceivingStatus(code, event)
            if (status === 2) {
                return receivingError.imported(event)
            } else {
                const stocksUpsert = stocksReq.map(e => {
                    return {
                        where: {
                            id: e.id || undefined
                        },
                        create: {
                            inQuantity: e.inQuantity || 0,
                            productCode: e.productCode,
                            warehouseCode: e.warehouseCode,
                            // receivingCode: code,
                            createdBy: userAuthContext.getEmail(event),
                        },
                        update: {
                            inQuantity: e.inQuantity || 0,
                            productCode: e.productCode,
                            warehouseCode: e.warehouseCode,
                            // receivingCode: code,
                            lastUpdatedBy: userAuthContext.getEmail(event),
                            lastUpdatedAt: new Date()
                        }
                    }
                })
                return prismaClient.receiving.update({
                    where: {
                        code: code
                    },
                    data: {
                        status: isProgress ? 1 : 0,
                        stocks: {
                            upsert: stocksUpsert
                        }
                    }
                }).then(response => {
                    return response.code
                });
            }
        } else {
            const rcvCode = await prismaClient.receiving.create({
                data: {
                    code: 'RCV' + randomstring.generate({
                        length: 10,
                        charset: 'numeric'
                    }),
                    poCode: body.poCode,
                    status: isProgress ? 1 : 0,
                    createdBy: userAuthContext.getEmail(event),
                }
            }).then(data => {
                return data.code
            })
            if (rcvCode) {
                const stocksCreate = stocksReq.map(e => {
                    return {
                        inQuantity: e.inQuantity || 0,
                        createdBy: userAuthContext.getEmail(event),
                        productCode: e.productCode,
                        warehouseCode: e.warehouseCode,
                        receivingCode: rcvCode
                    }
                })
                await prismaClient.stock.createMany({
                    data: stocksCreate
                })
            }
            return rcvCode
        }
    } else {
        if (receivingCode) {
            const status = await getReceivingStatus(receivingCode, event)
            switch (updateType) {
                case "progress":
                    switch (status) {
                        case 0:
                            await setProgress(receivingCode)
                            setResponseStatus(event, 204, 'Progress')
                            break
                        case 1:
                            setResponseStatus(event, 204, 'Progress')
                            break
                        case 2:
                            return receivingError.imported(event)
                    }
                    break
                case "cancel":
                    switch (status) {
                        case 1:
                            await setCancel(receivingCode)
                            setResponseStatus(event, 204, 'Canceled Successfully')
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
                                return receivingError.outed(event)
                            } else {
                                await setCancel(receivingCode)
                                setResponseStatus(event, 204, 'Canceled Successfully')
                            }
                            break
                    }
                    break
                case "imported":
                    switch (status) {
                        case 0:
                            return handlerError({
                                isError: true,
                                message: 'Đơn chưa được tiến hành'
                            } as IResponseErrorObject, event)
                        case 1:
                            await setImported(receivingCode)
                            setResponseStatus(event, 204, 'Import completed')
                            break
                        case 3:
                            setResponseStatus(event, 204, 'Import completed')
                            break
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
            receivedDate: null
        }
    })
}

async function setProgress(receivingCode: string) {
    await prismaClient.receiving.update({
        where: {
            code: receivingCode
        },
        data: {
            status: 1
        }
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
