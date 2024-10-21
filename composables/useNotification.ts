import type {Notification} from "#ui/types/notification";

const id = ref(0)
export interface IToastOptions {
    type: 'success' | 'error'
    successTitle?: string
    errorTitle?: string
    successIcon?: string
    errorIcon?: string
    description?: string
    timeout?: number
    actions?: any[]
}

function getToastObject({
                            type = 'success',
                            successTitle = 'Success',
                            errorTitle = 'Error',
                            successIcon = 'i-heroicons-check-circle',
                            errorIcon = 'i-heroicons-x-circle-20-solid',
                            description,
                            timeout = 2000,
                            actions,
                        }: IToastOptions) {
    const id = ref(0)
    let object: Partial<Notification>  = {
        id: `${++id.value}`,
        timeout: timeout,
        description: description
    }
    switch (type) {
        case 'success':
            object.title = successTitle
            object.icon = successIcon
            object.color = 'green'
            break
        case 'error':
            object.title = errorTitle
            object.icon = errorIcon
            object.color = 'red'
            break
        default:
            throw new Error('Invalid toast type')
    }
    if (Array.isArray(actions)) {
        object.actions = actions
    }
    return object
}

function mapCustomToastObject(originalObject: object, newObject: object): Partial<Notification> {
    return <Partial<Notification>>useAssignWith(originalObject, newObject, (objValue, srcValue, key) => {
        if (key && originalObject.hasOwnProperty(key)) {
            return srcValue;
        }
        return objValue;
    })
}

export default {
    getToastObject,
    mapCustomToastObject
}