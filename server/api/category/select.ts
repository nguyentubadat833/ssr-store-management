import _ from 'lodash'
import {ICategoryParamsSelectReq} from "~/types/ICategory";


export default defineEventHandler(async (event) => {
    const params: ICategoryParamsSelectReq = getQuery(event)
    const {selectType, categoryCode} = params
    const selectField = {
        name: true,
        alias: true,
        code: true,
    }
    switch (selectType) {
        case 'many':
            return prismaClient.category.findMany({
                where: {
                    status: 1
                },
                select: selectField
            })
        case 'byCode':
            if (_.isString(categoryCode)) {
                return prismaClient.category.findUnique({
                    where: {
                        code: categoryCode,
                    },
                    select: selectField
                })
            }
    }
    return []
})