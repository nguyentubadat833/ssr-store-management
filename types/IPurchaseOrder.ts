export interface IPurchaseOrderDetail {
    id?: string
    poCode: string
    productCode: string
    quantity: number
    unitPrice?: number
    totalAmount: number
}

export interface IPurchaseOrderDetailUpdate {
    toCreate?: IPurchaseOrderDetail[]
    toUpdate?: IPurchaseOrderDetail[]
    toDelete?: string[]
}

export interface IPurchaseOrderDto {
    code?: string
    supplierCode: string
    status?: number
    orderDate?: Date,
    dateOfReceipt?: Date,
    details?: IPurchaseOrderDetail[] | IPurchaseOrderDetailUpdate
}

export interface IPurchaseOrderParamsSelectReq {
    selectType: 'many' | 'byCode',
    poCode?: string
}

export interface IPurchaseOrderDeleteReq {
    poCode: string
}

export interface IPurchaseOrderParamsUpdateReq {
    updateType: 'confirm' | 'cancel' | 'update',
    poCode: string
}

export interface IPurchaseOrderUpdateReq {
    params: IPurchaseOrderParamsUpdateReq
    data?: IPurchaseOrderDto
}
