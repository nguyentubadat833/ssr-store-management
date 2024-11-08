import type {Notification} from "#ui/types/notification";
import {getResponseMessageValue} from "~/types/IResponse";

interface IUseAPIObject {
    endpoint: string,
    method?: string,
    params?: object,
    body?: object,
    isShowSuccessMessage?: boolean,
    isShowErrorMessage?: boolean,
    isUseDefaultProcessOnResponse?: boolean,
    customProcessOnResponse?: any,
    callbackMethodOnSuccess?: any,
    callbackMethodOnError?: any,
    requestOptionsCustom?: any,
    toastSuccessObjectCustom?: any,
    toastErrorObjectCustom?: any
}

interface IRequestOptions {
    method: any,
    params?: object,
    body?: object
}

export default async function ({
                                   endpoint = '',
                                   method = 'GET',
                                   params,
                                   body,
                                   isShowSuccessMessage = true,
                                   isShowErrorMessage = true,
                                   isUseDefaultProcessOnResponse = true,
                                   customProcessOnResponse,
                                   callbackMethodOnSuccess,
                                   callbackMethodOnError,
                                   requestOptionsCustom,
                                   toastSuccessObjectCustom,
                                   toastErrorObjectCustom
                               }: IUseAPIObject) {
    let result: any
    const toast = useToast()
    const {getToastObject, mapCustomToastObject} = useNotification
    if (!endpoint) {
        throw new Error('Endpoint is required')
    }

    const requestOptions = (): IRequestOptions => {
        return {
            method,
            ...(isObject(params) && {params}),
            ...(isObject(body) && {body}),
        }
    }

    await $fetch(endpoint, {
        ...requestOptions(),
        onRequest({options}) {
            if (isFunction(requestOptionsCustom)) {
                requestOptionsCustom(options)
            }
            options.timeout = 4000
        },
        onResponse({response, request}) {
            if (isUseDefaultProcessOnResponse) {
                if (response.ok) {
                    result = response._data
                    if (isFunction(callbackMethodOnSuccess)) {
                        callbackMethodOnSuccess()
                    }
                    if (isShowSuccessMessage) {
                        let description: string = ''
                        if (response.statusText in responseMessage) {
                            description = getResponseMessageValue(response.statusText as keyof typeof responseMessage, 'vi')
                        } else {
                            description = response.statusText
                        }
                        let toastObject: Partial<Notification> = getToastObject({
                            type: 'success',
                            description: description
                        })
                        if (isObject(toastSuccessObjectCustom)) {
                            toastObject = mapCustomToastObject(toastObject, toastSuccessObjectCustom)
                        }
                        toast.add(toastObject)
                    }
                } else {
                    if (isFunction(callbackMethodOnError)) {
                        callbackMethodOnError()
                    }
                    // if (isShowErrorMessage && response?._data?.isError) {
                    //     let toastObject = getToastObject({
                    //         type: 'error',
                    //         description: response?._data?.message
                    //     })
                    //     if (isObject(toastErrorObjectCustom)) {
                    //         toastObject = mapCustomToastObject(toastObject, toastErrorObjectCustom)
                    //     }
                    //     toast.add(toastObject)
                    // }
                }
            } else {
                if (isFunction(customProcessOnResponse)) {
                    customProcessOnResponse(response)
                }
            }
        },
    })
        .catch(e => {
            let description: string = ''
            if (e.statusText in responseMessage) {
                description = getResponseMessageValue(e.statusText as keyof typeof responseMessage, 'vi')
            }else {
                description = e.statusText
            }
            if (isShowErrorMessage) {
                let toastObject = getToastObject({
                    type: 'error',
                    description: description
                })
                if (isObject(toastErrorObjectCustom)) {
                    toastObject = mapCustomToastObject(toastObject, toastErrorObjectCustom)
                }
                toast.add(toastObject)
            }
        })
    return result ? result : null

}