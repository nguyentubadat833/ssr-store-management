export interface IStockAddReceivingReq {
    id?: string
    inQuantity: number
    productCode: string
    warehouseCode: string
    receivingCode: string
}

export interface IStockInfo {
    id: string
    orderQuantity: number
    inQuantity: number
    outQuantity?: number
    productCode: string
    productName: string
    warehouseCode: string
    warehouseName: string
    receivingCode: string
}

