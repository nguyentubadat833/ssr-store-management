import {IResponseErrorObject} from "~/types/IResponse";
import {EventHandlerRequest, H3Event} from "h3";

function ordered(event: H3Event<EventHandlerRequest>) {
    return handlerError({
        isError: true,
        message: 'Đơn hàng đang tiến hành'
    } as IResponseErrorObject, event)
}

export default {
    ordered
}