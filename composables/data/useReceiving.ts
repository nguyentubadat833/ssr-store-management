import type {IApiCurd} from "~/types/client/IApiCurd";
import type {
    IReceivingDeleteReq,
    IReceivingParamsSelectReq,
    IReceivingUpdateReq
} from "~/types/IReceiving";

export default function () {

    class apiCurd implements IApiCurd{

        keyData = {
            receivingKeyData: 'receiving-data'
        }

        receivingStatus() {
            const data: {status: number, name: string}[] = [
                {
                    status: 0,
                    name: 'Pending'
                },
                {
                    status: 1,
                    name: 'Progress'
                },
                {
                    status: 2,
                    name: 'Completed'
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

        async data() {
            return await useAPI({
                endpoint: '/api/receiving/select',
                params: {
                    selectType: 'many'
                } as IReceivingParamsSelectReq,
                isShowSuccessMessage: false
            })
        }

        async select(req: IReceivingParamsSelectReq) {
            return await useAPI({
                endpoint: '/api/receiving/select',
                params: req,
            })
        }

        async save(req: IReceivingUpdateReq) {
            return await useAPI({
                endpoint: '/api/receiving/save',
                method: 'PUT',
                params: req.params,
                body: req.body
            })
        }

        async del(req: IReceivingDeleteReq) {
            await useAPI({
                endpoint: '/api/receiving/delete',
                method: 'DELETE',
                params: req
            })
        }
    }

    return new apiCurd()
}