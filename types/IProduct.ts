export interface IProductDto {
    code?: string
    name: string
    alias?: string
    description?: string | null;
    categoryCode: string
    status?: number
}

export interface IProductParamsSelectReq {
    selectType: 'many' | 'byCode',
    productCode?: string
}

export interface IProductDeleteReq {
    productCode: string
}