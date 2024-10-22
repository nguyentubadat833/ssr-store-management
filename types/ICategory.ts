export interface ICategoryDto {
    code?: string
    name: string,
    alias?: string,
    status?: number,
}

export interface ICategoryParamsSelectReq {
    selectType: 'many' | 'byCode',
    categoryCode?: string
}

export interface ICategoryDeleteReq {
    categoryCode: string
}