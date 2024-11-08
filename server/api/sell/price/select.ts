import {IPriceParamsSelectReq} from "~/types/IPrice";

export default defineEventHandler(async (event) => {
    const params: IPriceParamsSelectReq = getQuery(event)
    const {type, productCode} = params
 })