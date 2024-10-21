export interface ICategoryCreate {
    name: string,
    createdBy: string
}

export interface ICategoryParamsSelectReq {
    selectType: 'many' | 'byCode',
    categoryCode?: string
}