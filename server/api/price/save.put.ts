import {IPriceParamsSaveReq, IPriceReq} from "~/types/IPrice";
import {Prisma} from "@prisma/client";

export default defineEventHandler(async (event) => {
    const params: IPriceParamsSaveReq = getQuery(event)
    const body: IPriceReq = await readBody(event)
    const {type} = params
    switch (type) {
        case "save":
            if (body.id) {

            } else {
                return prismaClient.price.create({
                    data: {
                        productCode: body.productCode,
                        priceData: body.priceData as unknown as Prisma.JsonObject,
                        createdBy: userAuthContext.getEmail(event)
                    }
                }).then(data => {
                    return data.productCode
                })
            }
    }
})