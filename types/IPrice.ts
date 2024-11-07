export interface IPriceReq {
    id?: string
    productCode: string
    priceData: IPriceData
}

export interface IPriceRes {
    id: string
    productCode: string
    priceData: IPriceData
}

export interface IPriceData {
    basePrice: number
    discountPrice?: number
    currency?: any
    startDate: Date
    endDate: Date
    status: number
}

export interface IPriceParamsSelectReq {
    type: 'many',
    productCode?: string
}

export interface IPriceParamsSaveReq {
    type: 'save',
    productCode: string
}

export interface IPriceSaveReq {
    params: IPriceParamsSaveReq,
    body: IPriceRes
}