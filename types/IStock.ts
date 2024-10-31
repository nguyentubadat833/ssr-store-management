export interface IStockDto {
    id?: string
    orderQuantity?: number
    inQuantity?: number
    outQuantity?: number
    status?: number
    productCode: string
    productName?: string
    warehouseCode: string
    receivingCode: string
    createdBy?: string
}