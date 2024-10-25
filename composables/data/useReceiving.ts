import type {IApiCurd} from "~/types/client/IApiCurd";
import type {
    IReceivingDto,
    IReceivingParamsSelectReq,
    IReceivingParamsUpdateReq,
    IReceivingUpdateReq
} from "~/types/IReceiving";

export default function () {

    class apiCurd implements IApiCurd{
        async data() {
            return await useAPI({
                endpoint: '/api/receiving/select',
                params: {
                    selectType: 'many'
                } as IReceivingParamsSelectReq
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