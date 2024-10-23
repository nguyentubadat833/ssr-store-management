import type {IApiCurd} from "~/types/client/IApiCurd";
import type {ISupplierDeleteReq, ISupplierDto, ISupplierParamsSelectReq} from "~/types/ISupplier";


export default function () {

    class apiCurd implements IApiCurd {

        keyData = {
            supplierKeyData: 'supplier-data'
        }

        getSupplierName(data: any, supplierCode: string) {
            if (isArray(data)) {
                const find = data.find(e => e.code === supplierCode)
                if (find) {
                    return find?.name
                }
            }
            return ''
        }

        async data(): Promise<any> {
            return await useAPI({
                endpoint: '/api/supplier/select',
                params: {
                    selectType: 'many'
                } as ISupplierParamsSelectReq,
                isShowSuccessMessage: false
            })
        }

        async save(data: ISupplierDto): Promise<string> {
            return await useAPI({
                endpoint: '/api/supplier/save',
                method: 'PUT',
                body: data
            })
        }

        async del(params: ISupplierDeleteReq) {
            await useAPI({
                endpoint: '/api/supplier/delete',
                method: 'DELETE',
                params: params
            })
        }
    }

    return new apiCurd()
}