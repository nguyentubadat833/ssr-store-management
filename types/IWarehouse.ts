

export interface IWarehouseDto {
    code?: string
    name: string
    location?: string
    maxCapacity: number
}

export interface IWarehouseParamsSelectReq {
    selectType: 'many' | 'byCode',
    warehouseCode?: string
}

export interface IWarehouseDeleteReq {
    warehouseCode: string
}