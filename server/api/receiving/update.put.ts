import {IReceivingParamsUpdateReq} from "~/types/IReceiving";
import receivingError from "~/server/utils/error/receivingError";

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
                        status: 2
                    }
                })
            }
            break
        case "update":

            break
    }
})