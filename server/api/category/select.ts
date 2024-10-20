import _ from 'lodash'
import categoryRepo from "~/server/repositories/categoryRepo";
export default defineEventHandler(async (event) => {
    const params = getQuery(event)
    const {selectType, categoryCode} = params
    switch (selectType) {
        case 'selectMany':
            return categoryRepo.selectManyByStatus();
        case 'selectByCode':
            if (_.isString(categoryCode)){
                return categoryRepo.selectByCode(categoryCode)
            }
    }
    return []
})