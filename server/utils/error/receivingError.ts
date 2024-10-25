import {EventHandlerRequest, H3Event} from "h3";
import {IResponseErrorObject} from "~/types/IResponse";

function imported(event: H3Event<EventHandlerRequest>) {
    return handlerError({
        isError: true,
        message: 'Đã hoàn thành nhập hàng'
    } as IResponseErrorObject, event)
}

function outed(event: H3Event<EventHandlerRequest>) {
    return handlerError({
        isError: true,
        message: 'Đã xuất hàng'
    } as IResponseErrorObject, event)
}


export default {
    imported,
    outed
}