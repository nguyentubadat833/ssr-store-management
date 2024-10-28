import type {Notification} from "#ui/types/notification";

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
            ...(isObject(params) && { params }),
            ...(isObject(body) && { body }),
        }
    }

    await $fetch(endpoint, {
        ...requestOptions(),
        onRequest({options}) {
            if (isFunction(requestOptionsCustom)) {
                requestOptionsCustom(options)
            }
        },
        onResponse({response, request}) {
            // console.log(response)
            if (isUseDefaultProcessOnResponse) {
                if (response.ok) {
                    result = response._data
                    if (isFunction(callbackMethodOnSuccess)) {
                        callbackMethodOnSuccess()
                    }
                    if (isShowSuccessMessage) {
                        let toastObject: Partial<Notification> = getToastObject({
                            type: 'success',
                            description: response?.statusText
                        })
                        if (isObject(toastSuccessObjectCustom)) {
                            toastObject = mapCustomToastObject(toastObject, toastSuccessObjectCustom)
                            console.log(toastObject)
                        }
                        toast.add(toastObject)
                    }
                } else {
                    if (isFunction(callbackMethodOnError)) {
                        callbackMethodOnError()
                    }
                    if (isShowErrorMessage && response?._data?.isError) {
                        let toastObject = getToastObject({
                            type: 'error',
                            description: response?._data?.message
                        })
                        if (isObject(toastErrorObjectCustom)) {
                            toastObject = mapCustomToastObject(toastObject, toastErrorObjectCustom)
                        }
                        toast.add(toastObject)
                    }
                }
            } else {
                if (isFunction(customProcessOnResponse)) {
                    customProcessOnResponse(response)
                }
            }
        }
    })
    return result ? result : null

}