import {IResponseErrorObject} from "~/types/IResponse";
import {EventHandlerRequest, H3Event} from "h3";
import {Prisma} from "@prisma/client";

export default function (error: any, event: H3Event<EventHandlerRequest>) {
    if ('isError' in error) {
        setResponseStatus(event, 'code' in error ? error.code : 400)
        return {
            isError: error.isError,
            message: error.message
        } as IResponseErrorObject
    } else {
        let errorObject: IResponseErrorObject = {
            isError: true
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            const code = error.code
            switch (code) {
                case 'P2014':
                    setResponseStatus(event, 400)
                    errorObject.message = 'Đối tượng đang bị ràng buộc'
                    return errorObject
            }
        }
        console.log(error)
        setResponseStatus(event, 400)
        errorObject.message = 'Lỗi thao tác'
        return errorObject
    }

}