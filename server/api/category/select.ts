import _ from 'lodash'
import categoryRepo from "~/server/repositories/categoryRepo";
import {ICategoryParamsSelectReq} from "~/types/ICategory";
export default defineEventHandler(async (event) => {
    const params: ICategoryParamsSelectReq = getQuery(event)
    const {selectType, categoryCode} = params
    console.log('params', params)
    switch (selectType) {
        case 'many':
            return categoryRepo.selectManyByStatus();
        case 'byCode':
            if (_.isString(categoryCode)){
                return categoryRepo.selectByCode(categoryCode)
            }
    }
    return []
})