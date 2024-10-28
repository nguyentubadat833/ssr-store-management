import {type IReceivingBodyReq, IReceivingParamsUpdateReq} from "~/types/IReceiving";
import receivingError from "~/server/utils/error/receivingError";
import _ from 'lodash'
import {IResponseErrorObject} from "~/types/IResponse";

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsUpdateReq = getQuery(event)
    const {updateType, receivingCode} = params
    const status = await prismaClient.receiving.findUniqueOrThrow({
        where: {
            code: receivingCode
        },
        select: {
            status: true
        }
    }).then((data) => {
        return data?.status
    }).catch(error => {
        return handlerError(error, event)
    })
    switch (updateType) {
        case "progress":
            switch (status) {
                case 0:
                    await prismaClient.receiving.update({
                        where: {
                            code: receivingCode
                        },
                        data: {
                            status: 1
                        }
                    })
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
            async function cancel() {
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
            switch (status) {
                case 1:
                    await cancel()
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
                    }else {
                        await cancel()
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
                    await prismaClient.receiving.update({
                        where: {
                            code: receivingCode
                        },
                        data: {
                            receivedDate: new Date(),
                            status: 2
                        }
                    })
                    setResponseStatus(event, 204, 'Import completed')
                    break
                case 3:
                    setResponseStatus(event, 204, 'Import completed')
                    break
            }
            break
        case "curdStock":
            const dataReq: IReceivingBodyReq = await readBody(event)
            const {stock: stockReq} = dataReq
            const {toCreate, toUpdate, toDelete} = stockReq
            if (_.isArray(toCreate) && toCreate.length > 0) {
                await prismaClient.stock.createMany({
                    data: toCreate.map(e => {
                        return {
                            ...e,
                            createdBy: userAuthContext.getEmail(event)
                        }
                    })
                })
            }
            if (_.isArray(toUpdate) && toUpdate.length > 0) {
                await Promise.all(toUpdate.map(async (stock) => {
                    await prismaClient.stock.update({
                        where: {
                            id: stock.id
                        },
                        data: {
                            inQuantity: stock.inQuantity,
                            outQuantity: stock.outQuantity,
                            productCode: stock.productCode,
                            warehouseCode: stock.warehouseCode,
                            receivingCode: stock.receivingCode,
                            createdBy: userAuthContext.getEmail(event)
                        }
                    })
                }))
            }
            if (_.isArray(toDelete) && toDelete.length > 0) {
                await prismaClient.stock.deleteMany({
                    where: {
                        id: {
                            in: toDelete
                        }
                    }
                })
            }
            break
    }
})