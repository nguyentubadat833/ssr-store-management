export interface IPurchaseOrderDetail {
    status?: number
    productCode: string
    productName?: string
    quantity: number
    unitPrice?: number
    totalAmount: number
}

export interface IPurchaseOrderReq {
    supplierCode: string
    description?: string
    details?: IPurchaseOrderDetail[]
}

export interface IPurchaseOrderRes {
    code: string
    supplierCode: string
    supplierName?: string
    description?: string
    status: number
    orderDate?: Date,
    dateOfReceipt?: Date,
    details?: IPurchaseOrderDetail[]
}

export interface IPurchaseOrderParamsSelectReq {
    selectType: 'many' | 'manyOrdered' | 'byCode',
    poCode?: string
}

export interface IPurchaseOrderDeleteReq {
    poCode: string
}

export interface IPurchaseOrderParamsSaveReq {
    type: 'confirm' | 'cancel' | 'save',
    poCode: string
}

export interface IPurchaseOrderSaveReq {
    params: IPurchaseOrderParamsSaveReq
    data?: IPurchaseOrderReq
}
