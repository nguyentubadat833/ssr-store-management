import {ICategoryCreate} from "~/types/ICategory";
import categoryRepo from "~/server/repositories/categoryRepo";

export default defineEventHandler(async (event) => {
    const body: ICategoryCreate = await readBody(event)
    const result = await categoryRepo.create(body)
    if (result) {
        return result.code
    } else {
        setResponseStatus(event, 400)
    }
})