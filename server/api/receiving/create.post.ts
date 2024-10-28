import {IReceivingDto} from "~/types/IReceiving";
import randomstring from "randomstring";

export default defineEventHandler(async (event) => {
    const body: IReceivingDto = await readBody(event)
    const response = await prismaClient.receiving.create({
        data: {
            code: 'RCV' + randomstring.generate({
                length: 10,
                charset: 'numeric'
            }),
            poCode: body.poCode,
            createdBy: userAuthContext.getEmail(event),
        }
    })
    if (body.stocks.length > 0) {
        await prismaClient.stock.createMany({
            data: body.stocks.map(e => {
                return {
                    inQuantity: e.inQuantity,
                    productCode: e.productCode,
                    warehouseCode: e.warehouseCode,
                    receivingCode: response.code,
                    createdBy: userAuthContext.getEmail(event)
                }
            })
        })
    }
    return response.code
})