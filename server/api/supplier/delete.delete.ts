import {ISupplierDeleteReq} from "~/types/ISupplier";


export default defineEventHandler(async (event) => {
    const params: ISupplierDeleteReq = getQuery(event)
    await prismaClient.supplier.delete({
        where: {
            code: params.supplierCode
        }
    }).then(() => {
        setResponseStatus(event, 204)
    })
})