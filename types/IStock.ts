export interface IStockDto {
    id?: string
    orderQuantity?: number
    inQuantity: number
    outQuantity?: number
    status?: number
    productCode: string
    productName?: string
    warehouseCode: string
    receivingCode: string
    createdBy?: string
}
export interface IStockCurd {
    toCreate?: IStockDto[]
    toUpdate?: IStockDto[]
    toDelete?: string[]
}