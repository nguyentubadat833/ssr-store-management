import {IPriceParamsSelectReq} from "~/types/IPrice";

export default defineEventHandler(async (event) => {
    const params: IPriceParamsSelectReq = getQuery(event)
    const {type} = params
    switch (type) {
        case "many":
            return prismaClient.price.findMany();
    }
})