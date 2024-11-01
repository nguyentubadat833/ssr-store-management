export interface IResponseErrorObject {
    isError: boolean
    message?: string
    code?: number
    redirect?: string
}

export const responseMessage = {
    receivingDispatch: {
        en: 'Stock dispatch completed',
        vi: 'Đã thực hiện xuất hàng'
    },
    receivingComplete: {
        en: 'Stock entry completed',
        vi: 'Nhập kho đã hoàn tất'
    },
    receivingPending: {
        en: 'Stock entry not yet initiated',
        vi: 'Chưa tiến hành nhập kho'
    },
    purchaseOrderPending: {
      en: 'Order not yet processed',
      vi: 'Đơn hàng chưa tiến hành'
    },
    purchaseOrderNoProduct: {
        en: 'No products available',
        vi: 'Không có sản phẩm nào'
    },
    purchaseOrderOrdered: {
        en: 'Order in progress',
        vi: 'Đơn hàng đang tiến hành'
    },
    purchaseOrderOrderedAndStockEntered: {
        en: 'Order processed and stock entered',
        vi: 'Đơn hàng đã tiến hành & nhập hàng'
    },
    invalidQuantityAndTotalAmount: {
        en: 'Invalid quantity và total amount',
        vi: ' Vui lòng nhập số lượng & tổng tiền'
    },
    invalidWarehouse: {
        en: 'Invalid warehouse',
        vi: 'Vui lòng chọn kho'
    },
    objectNotFound: {
        en: 'Object not found',
        vi: 'Đối tượng không tồn tại'
    },
    uniqueError: {
        en: 'The object is constrained',
        vi: 'Đối tượng đang bị ràng buộc'
    },
    prismaUnknownError: {
        en: 'Data processing error',
        vi: 'Lỗi xử lý dữ liệu'
    },
    unknownError: {
        en: 'unknownError',
        vi: 'Lỗi không xác định'
    },
    successfullyCanceled: {
        en: 'Successfully canceled',
        vi: 'Hủy thành công'
    }
}

export const getResponseMessageKey = (value: any, object: { [x: string]: any } = responseMessage) => {
    return Object.keys(object).find(key => object[key] === value);
};

export const getResponseMessageValue = (
    key: keyof typeof responseMessage,
    lang: 'en' | 'vi'
) => {
    return responseMessage[key][lang];
}