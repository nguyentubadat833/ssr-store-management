import type {IApiCurd} from "~/types/client/IApiCurd";
import type {IProductDeleteReq, IProductDto, IProductParamsSelectReq} from "~/types/IProduct";

export default function () {

    class apiCurd implements IApiCurd {

        keyData = {
            productKeyData: 'product-data'
        }

        async data(): Promise<any> {
            return await useAPI({
                endpoint: '/api/product/select',
                params: {
                    selectType: 'many'
                } as IProductParamsSelectReq,
                isShowSuccessMessage: false
            })
        }

        getProductName(data: any, productCode: string) {
            if (isArray(data)) {
                const find = data.find(e => e.code === productCode)
                if (find) {
                    return find?.name
                }
            }
            return ''
        }

        async save(data: IProductDto): Promise<string> {
            return await useAPI({
                endpoint: '/api/product/save',
                method: 'PUT',
                body: data
            })
        }

        async del(params: IProductDeleteReq) {
            await useAPI({
                endpoint: '/api/product/delete',
                method: 'DELETE',
                params: params
            })
        }
    }

    return new apiCurd()
}