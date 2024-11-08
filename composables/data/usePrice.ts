import type {IApiCurd} from "~/types/client/IApiCurd";
import type {IPriceSaveReq} from "~/types/IPrice";

export default function () {

    class apiCurd implements IApiCurd {
        keyData = {
            priceDataKey: 'price-data'
        }

        async save(data: IPriceSaveReq): Promise<any> {
            return await useAPI({
                endpoint: '/api/sell/price/save',
                method: 'PUT',
                params: data.params,
                body: data.body
            })
        }

    }

    return new apiCurd()
}

