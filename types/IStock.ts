export interface IStockDto {
    id?: string
    inQuantity: number
    outQuantity?: number
    status?: number
    productCode: string
    warehouseCode: string
    receivingCode: string
    createdBy?: string
}
export interface IStockCurd {
    toCreate?: IStockDto[]
    toUpdate?: IStockDto[]
    toDelete?: string[]
}