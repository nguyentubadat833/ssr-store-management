import {IWarehouseParamsSelectReq} from "~/types/IWarehouse";

export default defineEventHandler(async (event) => {
    const params: IWarehouseParamsSelectReq =  getQuery(event)
    const {selectType} = params
    const selectField = {
        code: true,
        name: true,
        location: true,
        maxCapacity: true,
    }
    switch (selectType) {
        case "many":
            return prismaClient.warehouse.findMany({
                select: selectField,
            })

    }
})