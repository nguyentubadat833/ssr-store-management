import {ICategoryUpdate} from "~/types/ICategory";
import categoryRepo from "~/server/repositories/categoryRepo";

export default defineEventHandler(async (event) => {
    const data: ICategoryUpdate = await readBody(event)
    const result = await categoryRepo.update(data)
    if (result){
        return result.code
    }else {
        setResponseStatus(event, 400)
    }
})