interface IPurchaseOrderDetail {
    poCode: string
    productCode: string
    quantity: number
    unitPrice?: number
    totalAmount: number
}

export interface IPurchaseOrderDto {
    code?: string
    supplierCode: string
    status?: number
    orderDate?: Date,
    dateOfReceipt?: Date,
    details?: IPurchaseOrderDetail[]
}

export interface IPurchaseOrderParamsSelectReq {
    selectType: 'many' | 'byCode',
    poCode?: string
}

export interface IPurchaseOrderDeleteReq {
    poCode: string
}
