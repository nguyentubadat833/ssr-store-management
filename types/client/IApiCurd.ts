export interface IApiCurd {
    keyData?: {
        [key: string]: any;
    }
    data?: (req?: any) => any,
    save?: (req: any) => any,
    select?: (req: any) => any,
    create?: (req: any) => any,
    update?: (req: any) => any,
    del?: (req: any) => any
}