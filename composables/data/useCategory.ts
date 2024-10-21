import type {IApiCurd} from "~/types/client/IApiCurd";
import type {ICategoryCreate, ICategoryDeleteReq, ICategoryParamsSelectReq, ICategoryUpdate} from "~/types/ICategory";
import prisma from "~/lib/prisma";

export default function () {

    class apiCurd implements IApiCurd {
        keyData = {
            categoryDataKey: 'category-data'
        }

        async data(): Promise<any> {
            return await useAPI({
                endpoint: '/api/category/select',
                params: {
                    selectType: 'many'
                } as ICategoryParamsSelectReq
            })
        }

        async select(req: ICategoryParamsSelectReq): Promise<any> {
            console.log(req)
            return await useAPI({
                endpoint: '/api/category/select',
                params: req
            })
        }

        async create(data: ICategoryCreate): Promise<any> {
            return await useAPI({
                endpoint: '/api/category/create',
                method: 'POST',
                body: data
            })
        }

        async update(data: ICategoryUpdate): Promise<any> {
            return await useAPI({
                endpoint: '/api/category/update',
                method: 'PUT',
                body: data
            })
        }

        async del(params: ICategoryDeleteReq): Promise<any> {
            let result: string | undefined
            await useAPI({
                endpoint: '/api/category/delete',
                method: 'DELETE',
                params: params,
                callbackMethodOnSuccess: () => {
                    result = 'success'
                }
            })
            return result
        }

    }

    return new apiCurd()
}


