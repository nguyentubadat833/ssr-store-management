export interface IApiCurd {
    keyData?: {
        [key: string]: any;
    }
    data?: (req?: IClientObjectReq) => any,
    save?: (req?: IClientObjectReq) => any,
    select?: (req?: IClientObjectReq) => any,
    create?: (req?: IClientObjectReq) => any,
    update?: (req?: IClientObjectReq) => any,
    delete?: (req?: IClientObjectReq) => any
}

export interface IClientObjectReq {

}