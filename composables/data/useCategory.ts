import type {IApiCurd} from "~/types/client/IApiCurd";
import type {
    ICategoryDeleteReq,
    ICategoryDto,
    ICategoryParamsSelectReq,
} from "~/types/ICategory";

export default function () {

    class apiCurd implements IApiCurd {
        keyData = {
            categoryDataKey: 'category-data'
        }

        getCategoryName(data: any, categoryCode: string) {
            if (isArray(data)) {
                const find = data.find(e => e.code === categoryCode)
                if (find) {
                    return find?.name
                }
            }
            return ''
        }

        async data(): Promise<any> {
            return await useAPI({
                endpoint: '/api/category/select',
                params: {
                    selectType: 'many'
                } as ICategoryParamsSelectReq
                ,isShowSuccessMessage: false
            })
        }

        // async select(req: ICategoryParamsSelectReq): Promise<any> {
        //     console.log(req)
        //     return await useAPI({
        //         endpoint: '/api/category/select',
        //         params: req,
        //     })
        // }

        async save(data: ICategoryDto): Promise<string> {
            return await useAPI({
                endpoint: '/api/category/save',
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


