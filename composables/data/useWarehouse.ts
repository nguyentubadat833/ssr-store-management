import type {IApiCurd} from "~/types/client/IApiCurd";
import type {IWarehouseDeleteReq, IWarehouseDto, IWarehouseParamsSelectReq} from "~/types/IWarehouse";



export default function () {

    class apiCurd implements IApiCurd {

        keyData = {
            warehouseKeyData: 'warehouse-data'
        }

        async data(): Promise<any> {
            return await useAPI({
                endpoint: '/api/warehouse/select',
                params: {
                    selectType: 'many'
                } as IWarehouseParamsSelectReq,
                isShowSuccessMessage: false
            })
        }

        async save(data: IWarehouseDto): Promise<string> {
            return await useAPI({
                endpoint: '/api/warehouse/save',
                method: 'PUT',
                body: data
            })
        }

        async del(params: IWarehouseDeleteReq) {
            await useAPI({
                endpoint: '/api/warehouse/delete',
                method: 'DELETE',
                params: params
            })
        }
    }

    return new apiCurd()
}