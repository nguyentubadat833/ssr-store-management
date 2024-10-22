import randomstring from "randomstring";
import {IWarehouseDto} from "~/types/IWarehouse";

export default defineEventHandler(async (event) => {
    const data: IWarehouseDto = await readBody(event)
    let response: any
    if (data.code) {
        response = await prismaClient.warehouse.update({
            where: {
                code: data.code
            },
            data: {
                name: data.name,
                location: data.location,
                maxCapacity: data.maxCapacity,
                lastUpdatedAt: new Date(),
                lastUpdatedBy: userAuthContext.getEmail(event)
            },
        })
    } else {
        response = await prismaClient.warehouse.create({
            data: {
                code: 'WRH' + randomstring.generate({
                    length: 5,
                    charset: 'numeric'
                }),
                name: data.name,
                location: data.location,
                maxCapacity: data.maxCapacity,
                createdBy: userAuthContext.getEmail(event)
            },
        })
        setResponseStatus(event, 201)
    }
    return response.code
})