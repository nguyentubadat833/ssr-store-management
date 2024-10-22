import {EventHandlerRequest, H3Event} from "h3";

function getEmail(event: H3Event<EventHandlerRequest>): string {
    const {user} = event.context
    return user?.email || 'unknown'
}

export default {
    getEmail
}