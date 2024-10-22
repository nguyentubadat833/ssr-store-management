import {IProductDeleteReq} from "~/types/IProduct";

export default defineEventHandler(async (event) => {
    const params: IProductDeleteReq = getQuery(event)
    await prismaClient.product.delete({
        where: {
            code: params.productCode
        }
    }).then(() => {
        setResponseStatus(event, 204)
    })
})