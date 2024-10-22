
export interface ISupplierInfo {
    name: string
}

export interface ISupplierDto {
    code?: string
    info?: any
}

export interface ISupplierParamsSelectReq {
    selectType: 'many' | 'byCode',
    supplierCode?: string
}

export interface ISupplierDeleteReq {
    supplierCode: string
}