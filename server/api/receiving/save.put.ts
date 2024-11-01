import {IReceivingDto, type IReceivingParamsUpdateReq} from "~/types/IReceiving";
import receivingError from "~/server/utils/error/receivingError";
import {IResponseErrorObject, getResponseMessageKey, responseMessage} from "~/types/IResponse";
import randomstring from "randomstring";
import {EventHandlerRequest, H3Event} from "h3";
import {IStockDto} from "~/types/IStock";
import {da} from "cronstrue/dist/i18n/locales/da";

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsUpdateReq = getQuery(event)
    const {updateType, receivingCode, stockId} = params
    const body: IReceivingDto = await readBody(event)
    if (updateType === 'save') {
        const {code, stocks: stocksReq} = body
        const isNonSelectWarehouse = stocksReq.some(e => e.inQuantity && e.inQuantity > 0 && !e.warehouseCode)
        if (isNonSelectWarehouse) {
            throw createError({
                statusCode: 400,
                statusText: getResponseMessageKey(responseMessage.invalidWarehouse)
            })
        }
        const isProgress = stocksReq.some(e => {
            return e.inQuantity && e.inQuantity > 0
        })
        if (code) {
            const status = await getReceivingStatus(code, event)
            if (status === 2) {
                throw createError({
                    statusCode: 400,
                    statusText: getResponseMessageKey(responseMessage.receivingComplete)
                })
            } else {
                let toCreate: {
                    inQuantity: number;
                    productCode: string;
                    warehouseCode: string;
                    createdBy: string;
                }[] = []
                let toUpdate: {
                    where: {
                        id: string;
                    };
                    data: {
                        inQuantity: number; productCode: string; warehouseCode: string;
                        lastUpdatedBy: string; lastUpdatedAt: Date;
                    };
                }[] = []
                stocksReq.forEach(e => {
                    if (e.id) {
                        toUpdate.push({
                            where: {
                                id: e.id
                            },
                            data: {
                                inQuantity: e.inQuantity || 0,
                                productCode: e.productCode,
                                warehouseCode: e.warehouseCode,
                                // receivingCode: code,
                                lastUpdatedBy: userAuthContext.getEmail(event),
                                lastUpdatedAt: new Date()
                            }
                        })
                    } else {
                        toCreate.push({
                            inQuantity: e.inQuantity || 0,
                            productCode: e.productCode,
                            warehouseCode: e.warehouseCode,
                            // receivingCode: code,
                            createdBy: userAuthContext.getEmail(event),
                        })
                    }
                })
                return prismaClient.receiving.update({
                    where: {
                        code: code
                    },
                    data: {
                        status: isProgress ? 1 : 0,
                        stocks: {
                            update: toUpdate,
                            create: toCreate
                        }
                    }
                }).then(response => {
                    return response.code
                });
            }
        } else {
            const dataCreate = await prismaClient.receiving.create({
                data: {
                    code: 'RCV' + randomstring.generate({
                        length: 10,
                        charset: 'numeric'
                    }),
                    poCode: body.poCode,
                    status: isProgress ? 1 : 0,
                    createdBy: userAuthContext.getEmail(event),
                },
                select: {
                    status: true,
                    po: {
                        select: {
                            code: true,
                            status: true
                        }
                    }
                }
            })
            if (isProgress && dataCreate.po.status !== 2) {
                await prismaClient.purchaseOrder.update({
                    where: {
                        code: dataCreate.po.code
                    },
                    data: {
                        status: 2
                    }
                })
            }
            const rcvCode = dataCreate.po.code
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
                                throw createError({
                                    statusCode: 400,
                                    statusText: getResponseMessageKey(responseMessage.receivingDispatch)
                                })
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
                            throw createError({
                                statusCode: 400,
                                statusText: getResponseMessageKey(responseMessage.receivingPending)
                            })
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
    const dataUpdate = await prismaClient.receiving.update({
        where: {
            code: receivingCode
        },
        data: {
            status: 0,
            receivedDate: null
        },
        select: {
            po: {
                select: {
                    code: true,
                    receiving: true
                }
            }
        }
    })
    console.log('dataUpdate.po.receiving', dataUpdate.po.receiving)
    // if (dataUpdate.po.receiving.length === 0) {
    //     console.log('dataUpdate:Po:Rcv', dataUpdate.po.receiving)
    //     await prismaClient.purchaseOrder.update({
    //         where: {
    //             code: dataUpdate.po.code
    //         },
    //         data: {
    //             status: 1
    //         }
    //     })
    // }
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
