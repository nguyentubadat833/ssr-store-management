import {type IReceivingBodyReq, IReceivingParamsUpdateReq} from "~/types/IReceiving";
import receivingError from "~/server/utils/error/receivingError";
import type {IStockCurd, IStockDto} from "~/types/IStock";
import _ from 'lodash'

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsUpdateReq = getQuery(event)
    const dataReq: IReceivingBodyReq = await readBody(event)
    const {stock: stockReq} = dataReq
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
                    await prismaClient.receiving.update({
                        where: {
                            code: receivingCode
                        },
                        data: {
                            status: 0
                        }
                    })
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
                    }
            }
            break
        case "imported":
            if (status === 2) {
                setResponseStatus(event, 204, 'Imported')
            } else {
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
            break
        case "curdStock":
            const {toCreate, toUpdate, toDelete} = stockReq
            if (_.isArray(toCreate) && toCreate.length > 0){
                await prismaClient.stock.createMany({
                    data: toCreate.map(e => {
                        return{
                            ...e,
                            createdBy: userAuthContext.getEmail(event)
                        }
                    })
                })
            }
            if (_.isArray(toUpdate) && toUpdate.length > 0){
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
            if (_.isArray(toDelete) && toDelete.length > 0){
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