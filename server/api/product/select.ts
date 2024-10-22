import { IProductParamsSelectReq} from "~/types/IProduct";

export default defineEventHandler(async (event) => {
    const params: IProductParamsSelectReq =  getQuery(event)
    const {selectType} = params
    const selectField = {
        code: true,
        name: true,
        alias: true,
        categoryCode: true,
        description: true,
        status: true
    }
    switch (selectType) {
        case "many":
            return prismaClient.product.findMany({
                where: {
                    status: 1,
                },
                select: selectField,
            })

    }
})