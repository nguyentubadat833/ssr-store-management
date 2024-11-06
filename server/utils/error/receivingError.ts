import {EventHandlerRequest, H3Event} from "h3";
import {getResponseMessageKey, IResponseErrorObject, responseMessage} from "~/types/IResponse";

function invalidWarehouse() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.invalidWarehouse)
    })
}

function complete() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.receivingComplete)
    })
}

function dispatch() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.receivingDispatch)
    })
}

function pending() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.receivingPending)
    })
}


export default {
    invalidWarehouse,
    complete,
    dispatch,
    pending
}