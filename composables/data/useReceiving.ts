import type {IApiCurd} from "~/types/client/IApiCurd";
import type {
    IReceivingDto,
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
                    name: 'Imported'
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

        async create(data: IReceivingDto) {
            return await useAPI({
                endpoint: '/api/receiving/create',
                method: 'POST',
                body: data
            })
        }

        async update(req: IReceivingUpdateReq) {
            await useAPI({
                endpoint: '/api/receiving/update',
                method: 'PUT',
                params: req.params,
                body: req.body
            })
        }
    }

    return new apiCurd()
}