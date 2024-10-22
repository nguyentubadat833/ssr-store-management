
import slug from "slug";
import randomstring from "randomstring";
import {ISupplierDto, ISupplierInfo} from "~/types/ISupplier";

export default defineEventHandler(async (event) => {
    const data: ISupplierDto = await readBody(event)
    let response: ISupplierDto
    const selectField = {
        code: true,
        info: true
    }
    if (data.code) {
        response = await prismaClient.supplier.update({
            where: {
                code: data.code
            },
            data: {
                info: data.info,
                lastUpdatedAt: new Date(),
                lastUpdatedBy: userAuthContext.getEmail(event)
            },
            select: selectField
        })
    } else {
        response = await prismaClient.supplier.create({
            data: {
                code: 'SPL' + randomstring.generate({
                    length: 5,
                    charset: 'numeric'
                }),
                info: data.info,
                createdBy: userAuthContext.getEmail(event)
            },
            select: selectField
        })
        setResponseStatus(event, 201)
    }
    return response.code
})