import type {IStockAddReceivingReq, IStockInfo} from "~/types/IStock";

export interface IReceivingReq {
    code?: string
    poCode: string
    stocks?: IStockAddReceivingReq[]
}

export interface IReceivingRes {
    code: string,
    poCode: string,
    status: number,
    receivedDate?: Date,
    stocks?: IStockInfo[]
}

export interface IReceivingParamsSaveReq {
    type: 'cancel' | 'progress' | 'imported' | 'deleteStock' | 'save',
    receivingCode?: string
    stockId?: string
}

export interface IReceivingSaveReq {
    params: IReceivingParamsSaveReq,
    body?: IReceivingReq
}

export interface IReceivingParamsSelectReq {
    selectType: 'many' | 'byCode'
    receivingCode?: string
}

export interface IReceivingDeleteReq {
    receivingCode: string
}
