import type {IApiCurd} from "~/types/client/IApiCurd";
import type {IPurchaseOrderDeleteReq, IPurchaseOrderDto, IPurchaseOrderParamsSelectReq} from "~/types/IPurchaseOrder";

export default function () {
    class apiCurd implements IApiCurd {

        keyData = {
            poKeyData: 'po-data'
        }

        purchaseOrderStatus() {
            const data: {status: number, name: string}[] = [
                {
                    status: 0,
                    name: 'Pending'
                },
                {
                    status: 1,
                    name: 'Ordered'
                },
                {
                    status: 2,
                    name: 'Received'
                },
            ]
            function map(status: number) {
                const find = data.find(e => e.status === status)
                if (find){
                    return find.name
                }else {
                    return 'unknown'
                }
            }
            return {
                data,
                map
            }
        }

        async data(): Promise<any> {
            return await useAPI({
                endpoint: '/api/purchaseOrder/select',
                params: {
                    selectType: 'many'
                } as IPurchaseOrderParamsSelectReq,
                isShowSuccessMessage: false
            })
        }

        async create(data: IPurchaseOrderDto): Promise<string> {
            return await useAPI({
                endpoint: '/api/purchaseOrder/create',
                method: 'POST',
                body: data
            })
        }

        async del(params: IPurchaseOrderDeleteReq) {
            await useAPI({
                endpoint: '/api/purchaseOrder/delete',
                method: 'DELETE',
                params: params
            })
        }
    }

    return new apiCurd()
}