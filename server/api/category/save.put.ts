import {ICategoryDto} from "~/types/ICategory";
import slug from "slug";
import randomstring from "randomstring";

export default defineEventHandler(async (event) => {
    const data: ICategoryDto = await readBody(event)
    let response: ICategoryDto
    if (data.code) {
        response = await prismaClient.category.update({
            where: {
                code: data.code
            },
            data: {
                name: data.name,
                alias: slug(data.name),
                status: data.status,
                lastUpdatedAt: new Date(),
                lastUpdatedBy: userAuthContext.getEmail(event)
            }
        })
    } else {
        response = await prismaClient.category.create({
            data: {
                code: 'CTG' + randomstring.generate({
                    length: 5,
                    charset: 'numeric'
                }),
                name: data.name,
                alias: slug(data.name),
                createdBy: userAuthContext.getEmail(event)
            }
        })
        setResponseStatus(event, 201)
    }
    return response.code
})