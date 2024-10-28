import type {IStockCurd, IStockDto} from "~/types/IStock";

export interface IReceivingDto {
    code?: string
    poCode: string
    status?: number
    receivedDate?: Date
    stocks: IStockDto[]
}

export interface IReceivingParamsUpdateReq {
    updateType: 'cancel' | 'progress' | 'imported' | 'curdStock',
    receivingCode: string
}

export interface IReceivingBodyReq {
    stock: IStockCurd
}

export interface IReceivingUpdateReq {
    params: IReceivingParamsUpdateReq,
    body?: IReceivingBodyReq
}

export interface IReceivingParamsSelectReq {
    selectType: 'many' | 'byCode' | 'getStockData',
    receivingCode?: string
}

export interface IReceivingDeleteReq {
    receivingCode: string
}
