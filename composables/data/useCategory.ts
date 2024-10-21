import type {IApiCurd, IClientObjectReq} from "~/types/client/IApiCurd";
import type {ICategoryParamsSelectReq} from "~/types/ICategory";

export default function () {

    class apiCurd implements IApiCurd {
        keyData = {
            categoryDataKey: 'category-data'
        }

        async data(req?: IClientObjectReq): Promise<any> {
            return await useAPI({
                endpoint: '/api/category/select',
                params: {
                    selectType: 'many'
                } as ICategoryParamsSelectReq
            })
        }

    }

    return new apiCurd()
}


