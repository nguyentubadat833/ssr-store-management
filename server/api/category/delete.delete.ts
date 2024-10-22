import {ICategoryDeleteReq} from "~/types/ICategory";

export default defineEventHandler(async (event) => {
    const params: ICategoryDeleteReq = getQuery(event)
    await prismaClient.category.delete({
        where: {
            code: params.categoryCode
        }
    })
    setResponseStatus(event, 204)
})