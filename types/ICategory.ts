export interface ICategoryCreate {
    name: string,
    createdBy?: string
}

export interface ICategoryUpdate {
    code: string
    name: string
    status?: number
    lastUpdatedBy?: string
}

export interface ICategoryParamsSelectReq {
    selectType: 'many' | 'byCode',
    categoryCode?: string
}

export interface ICategoryDeleteReq{
    categoryCode: string
}