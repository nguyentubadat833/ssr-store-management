import {IPriceDataObject, IPriceParamsSaveReq, IPriceReq} from "~/types/IPrice";
import {Prisma} from "@prisma/client";

export default defineEventHandler(async (event) => {
    const params: IPriceParamsSaveReq = getQuery(event)
    const body: IPriceReq = await readBody(event)
    const {type} = params
    switch (type) {
        case "save":
            const {priceObject, productCode} = body
            if (priceObject) {
                const {startDate, endDate} = priceObject
                if (!startDate || !endDate) {
                    throw createError({
                        statusCode: 400,
                        statusText: 'Invalid time applying'
                    })
                }else {
                    if (new Date(startDate) > new Date(endDate)) {
                        throw createError({
                            statusCode: 400,
                            statusText: 'Start date must be before End date'
                        });
                    }
                }
            }
            const priceData = await prismaClient.price.findUnique({
                where: {
                    productCode: productCode
                },
                select: {
                    priceData: true
                }
            }).then(data => {
                return data?.priceData as unknown as IPriceDataObject[]
            })
            if (priceData) {
                priceData.map(e => {
                    e.status = 0
                })
                if (priceObject) {
                    priceData.push({
                        ...priceObject,
                        status: 1
                    } as IPriceDataObject)
                }
                await prismaClient.price.update({
                    where: {
                        productCode: productCode
                    },
                    data: {
                        priceData: priceData as unknown as Prisma.JsonObject
                    }
                })
                setResponseStatus(event, 200, 'OK')
            } else {
                let priceData: IPriceDataObject[] = []
                if (priceObject) {
                    priceData.push({
                        ...priceObject,
                        status: 1
                    })
                }
                await prismaClient.price.create({
                    data: {
                        productCode: body.productCode,
                        priceData: priceData as unknown as Prisma.JsonObject,
                        createdBy: userAuthContext.getEmail(event)
                    }
                })
                setResponseStatus(event, 200, 'OK')
            }
            break
    }
})