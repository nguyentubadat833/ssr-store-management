import {ICategoryCreate} from "~/types/ICategory";
import * as randomstring from "randomstring";
import slug from "slug";


async function create(data: ICategoryCreate) {
    return prismaClient.category.create({
        data: {
            code: 'CTG' + randomstring.generate({
                length: 5,
                charset: 'numeric'
            }),
            name: data.name,
            alias: slug(data.name),
            createdBy: data.createdBy
        }
    });
}

async function selectManyByStatus({status = 1} = {}) {
    return prismaClient.category.findMany({
        where: {
            status: status
        }
    })
}

async function selectByCode(code: string) {
    return prismaClient.category.findUnique({
        where: {
            code: code
        }
    })
}

export default {
    create,
    selectManyByStatus,
    selectByCode
}