import {IReceivingParamsSelectReq, IReceivingRes} from "~/types/IReceiving";
import type {IStockInfo} from "~/types/IStock";
import {IPurchaseOrderDetail} from "~/types/IPurchaseOrder";

export default defineEventHandler(async (event) => {
    const params: IReceivingParamsSelectReq = getQuery(event)
    const {selectType, receivingCode} = params
    const selectField = {
        id: true,
        code: true,
        poCode: true,
        status: true,
        receivedDate: true,
        // stocks: true,
    }
    switch (selectType) {
        case "many":
            return prismaClient.receiving.findMany({
                select: selectField
            });
        case "byCode":
            return prismaClient.receiving.findUniqueOrThrow({
                where: {
                    code: receivingCode
                },
                include: {
                    po: {
                        select: {
                            details: true
                        }
                    },
                    stocks: {
                        where: {
                            status: 1
                        }
                    },
                }
            }).then(data => {
                const poDetails = data.po.details as unknown as IPurchaseOrderDetail[]
                return {
                    code: data.code,
                    poCode: data.poCode,
                    status: data.status,
                    receivedDate: data.receivedDate,
                    stocks: data.stocks.map(e => {
                        const findStock = poDetails.find(el => el.productCode === e.productCode)
                        const response = e as unknown as IStockInfo
                        if (findStock){
                            response.orderQuantity = findStock.quantity
                        }
                        return response
                    })
                } as unknown as IReceivingRes
            }).catch((error: any) => {
                return handlerError(error, event)
            })
    }
})