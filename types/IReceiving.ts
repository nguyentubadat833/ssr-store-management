export interface IReceivingDto {
    code?: string
    poCode: string
    status?: number
    receivedDate?: Date
}

export interface IReceivingParamsUpdateReq {
    updateType: 'cancel' | 'progress' | 'imported' | 'update',
    receivingCode: string
}

export interface IReceivingParamsSelectReq {
    selectType: 'many' | 'byCode',
    receivingCode?: string
}

export interface IReceivingDeleteReq {
    receivingCode: string
}
