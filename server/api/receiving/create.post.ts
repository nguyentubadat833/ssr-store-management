import {IReceivingDto} from "~/types/IReceiving";
import randomstring from "randomstring";

export default defineEventHandler(async (event) => {
    const body: IReceivingDto = await readBody(event)
    const response = await prismaClient.receiving.create({
        data: {
            code: 'RCV' + randomstring.generate({
                length: 10,
                charset: 'numeric'
            }),
            poCode: body.poCode,
            createdBy: userAuthContext.getEmail(event),
        }
    })
    return response.code
})