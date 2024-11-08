export interface IPriceReq {
    id?: string
    productCode: string
    priceObject?: IPriceDataObject
}

export interface IPriceRes {
    id: string
    productCode: string
    priceObject?: IPriceDataObject
}

export interface IPriceDataObject {
    basePrice: number
    discountPrice?: number
    currency?: any
    startDate: Date
    endDate: Date
    status?: number // 1.active
}

export interface IPriceParamsSelectReq {
    type: 'byProductCode',
    productCode?: string
}

export interface IPriceParamsSaveReq {
    type: 'save',
    // productCode: string
}

export interface IPriceSaveReq {
    params: IPriceParamsSaveReq,
    body: IPriceReq
}