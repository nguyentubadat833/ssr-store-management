import type {IStockDto} from "~/types/IStock";

export interface IReceivingDto {
    code?: string
    poCode: string
    status?: number
    receivedDate?: Date
    stocks: IStockDto[]
}

export interface IReceivingParamsUpdateReq {
    updateType: 'cancel' | 'progress' | 'imported' | 'save',
    receivingCode?: string
}

export interface IReceivingUpdateReq {
    params: IReceivingParamsUpdateReq,
    body?: IReceivingDto
}

export interface IReceivingParamsSelectReq {
    selectType: 'many' | 'byCode' | 'getStockData',
    receivingCode?: string
}

export interface IReceivingDeleteReq {
    receivingCode: string
}
