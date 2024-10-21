import {ICategoryCreate, ICategoryUpdate} from "~/types/ICategory";
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
            createdBy: data.createdBy || ''
        }
    });
}

function update(data: ICategoryUpdate) {
    return prismaClient.category.update({
        where: {
            code: data.code
        },
        data: {
            name: data.name,
            alias: slug(data.name),
            status: data.status,
            lastUpdatedAt: new Date(),
            lastUpdatedBy: data.lastUpdatedBy
        }
    })
}

async function selectManyByStatus({status = 1} = {}) {
    return prismaClient.category.findMany({
        where: {
            status: status
        },
        select: {
            name: true,
            alias: true,
            code: true,
        }
    })
}

async function selectByCode(code: string) {
    return prismaClient.category.findUnique({
        where: {
            code: code,
        },
        select: {
            name: true,
            alias: true,
            code: true,
        }
    })
}

async function del(code: string) {
    await prismaClient.category.delete({
        where: {
            code: code
        }
    })
}

export default {
    create,
    update,
    del,
    selectManyByStatus,
    selectByCode,
}