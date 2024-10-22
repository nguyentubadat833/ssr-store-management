import {IWarehouseDeleteReq} from "~/types/IWarehouse";

export default defineEventHandler(async (event) => {
    const params: IWarehouseDeleteReq = getQuery(event)
    await prismaClient.warehouse.delete({
        where: {
            code: params.warehouseCode
        }
    }).then(() => {
        setResponseStatus(event, 204)
    })
})