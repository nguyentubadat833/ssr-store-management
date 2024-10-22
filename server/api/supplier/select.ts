import {ISupplierParamsSelectReq} from "~/types/ISupplier";

export default defineEventHandler(async (event) => {
    const params: ISupplierParamsSelectReq =  getQuery(event)
    const {selectType} = params
    const selectField = {
        code: true,
        info: true,
    }
    switch (selectType) {
        case "many":
            return prismaClient.supplier.findMany({
                where: {
                    status: 1,
                },
                select: selectField,
            })

    }
})