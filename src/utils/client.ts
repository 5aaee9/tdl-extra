
import Client from 'tdl'

import {
    Update,
} from 'tdlib-types'

export async function waitMessagePresent(client: Client, id: number): Promise<number> {
    const resId: number = await (new Promise(res => {
        function waitEvent(update: Update) {
            if (update._ === 'updateMessageSendSucceeded') {
                if (update.old_message_id === id) {
                    res(update.message.id)
                    client.off('update', waitEvent)
                }
            }
        }

        client.on('update', waitEvent)
    }))

    return resId
}


export async function initChat(client: Client, chat: number): Promise<void> {
    try {
        await client.invoke({
            _: 'openChat',
            chat_id: chat,
        })
    } catch (e) {
        if (chat < -Math.pow(10, 12)) {
            await client.invoke({
                _: 'getSupergroup',
                supergroup_id: Math.abs(chat) - Math.pow(10, 12),
            })
            await client.invoke({
                _: 'createSupergroupChat',
                supergroup_id: Math.abs(chat) - Math.pow(10, 12),
                force: false,
            })
        } else if (chat < 0) {
            await client.invoke({
                _: 'getBasicGroup',
                basic_group_id: Math.abs(chat),
            })
            await client.invoke({
                _: 'createBasicGroupChat',
                basic_group_id: Math.abs(chat),
                force: false,
            })
        } else {
            await client.invoke({
                _: 'getUser',
                user_id: chat,
            })
            await client.invoke({
                _: 'createPrivateChat',
                user_id: chat,
                force: false,
            })
        }
    }
}