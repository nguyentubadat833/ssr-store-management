import {getResponseMessageKey, responseMessage} from "~/types/IResponse";

function ordered() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.purchaseOrderOrdered)
    })
}

function orderedAndStockEntered() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.purchaseOrderOrderedAndStockEntered)
    })
}

function orderToLinkReceiving() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.purchaseOrderToLinkReceiving)
    })
}

function orderNoProduct() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.purchaseOrderNoProduct)
    })
}

function invalidQuantityAndTotalAmount() {
    throw createError({
        statusCode: 400,
        statusText: getResponseMessageKey(responseMessage.invalidQuantityAndTotalAmount)
    })
}

export default {
    ordered,
    orderedAndStockEntered,
    orderToLinkReceiving,
    orderNoProduct,
    invalidQuantityAndTotalAmount
}