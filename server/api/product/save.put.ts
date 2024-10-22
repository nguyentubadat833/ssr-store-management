import {IProductDto} from "~/types/IProduct";
import slug from "slug";
import randomstring from "randomstring";

export default defineEventHandler(async (event) => {
    const data: IProductDto = await readBody(event)
    let response: IProductDto
    const selectField = {
        name: true,
        code: true,
        alias: true,
        description: true,
        categoryCode: true
    }
    if (data.code) {
        response = await prismaClient.product.update({
            where: {
                code: data.code
            },
            data: {
                categoryCode: data.categoryCode,
                name: data.name,
                alias: slug(data.name),
                description: data.description === null ? undefined : data.description,
                lastUpdatedAt: new Date(),
                lastUpdatedBy: userAuthContext.getEmail(event)
            },
            select: selectField
        })
    } else {
        response = await prismaClient.product.create({
            data: {
                code: 'PRD' + randomstring.generate({
                    length: 5,
                    charset: 'numeric'
                }),
                categoryCode: data.categoryCode,
                name: data.name,
                alias: slug(data.name),
                description: data.description === null ? undefined : data.description,
                createdBy: userAuthContext.getEmail(event)
            },
            select: selectField
        })
        setResponseStatus(event, 201)
    }
    return response.code
})