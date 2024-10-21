import {ICategoryDeleteReq} from "~/types/ICategory";
import categoryRepo from "~/server/repositories/categoryRepo";

export default defineEventHandler(async (event) => {
    const params: ICategoryDeleteReq = getQuery(event)
    await categoryRepo.del(params.categoryCode)
    setResponseStatus(event, 204)
})