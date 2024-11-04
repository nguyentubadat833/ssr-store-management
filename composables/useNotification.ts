import type {Notification} from "#ui/types/notification";

export interface IToastOptions {
    type: 'success' | 'info' | 'error' | 'warn'
    title?: string
    icon?: string
    // successTitle?: string
    // errorTitle?: string
    // successIcon?: string
    // errorIcon?: string
    description?: string
    timeout?: number
    actions?: any[]
}

function getToastObject({
                            type = 'success',
                            title = undefined,
                            icon = undefined,
                            // successTitle = 'Success',
                            // errorTitle = 'Error',
                            // successIcon = 'i-heroicons-check-circle',
                            // errorIcon = 'i-heroicons-x-circle-20-solid',
                            description,
                            timeout = 2000,
                            actions = undefined,
                        }: IToastOptions) {
    const id = ref(0)
    let object: Partial<Notification> = {
        id: `${++id.value}`,
        timeout: timeout,
        description: description
    }
    switch (type) {
        case 'success':
            // object.title = successTitle
            // object.icon = successIcon
            object.title = title || 'Success'
            object.icon = icon || 'i-heroicons-check-circle'
            object.color = 'green'
            break
        case "info":
            object.title = title || 'Information'
            object.icon = icon || 'ic:baseline-info'
            object.color = 'blue'
            break
        case "warn":
            object.title = title || 'Warn'
            object.icon = icon || 'ic:round-warning'
            object.color = 'orange'
            break
        case 'error':
            // object.title = errorTitle
            // object.icon = errorIcon
            object.title = title || 'Error'
            object.icon = icon || 'i-heroicons-x-circle-20-solid'
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