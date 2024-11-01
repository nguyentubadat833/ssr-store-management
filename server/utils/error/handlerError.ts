import {getResponseMessageKey, responseMessage} from "~/types/IResponse";
import {EventHandlerRequest, H3Event} from "h3";
import {Prisma} from "@prisma/client";

export default function (error: any, event: H3Event<EventHandlerRequest>) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const code = error.code
        switch (code) {
            case 'P2014':
                throw createError({
                    statusCode: 400,
                    statusText: getResponseMessageKey(responseMessage.uniqueError)
                })
            case 'P2001':
                throw createError({
                    statusCode: 400,
                    statusText: getResponseMessageKey(responseMessage.objectNotFound)
                })
            default:
                throw createError({
                    statusCode: 400,
                    statusText: getResponseMessageKey(responseMessage.prismaUnknownError)
                })
        }
    } else {
        throw createError({
            statusCode: 400,
            statusText: getResponseMessageKey(responseMessage.unknownError)
        })
    }
}