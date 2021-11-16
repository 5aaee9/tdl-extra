import {
    photoSize
} from 'tdlib-types'


export function biggestPhoto(sizes: photoSize[]): photoSize {
    return sizes.reduce((pre: photoSize | null, cur: photoSize) => {
        if (pre) {
            if (cur.height > pre.height || cur.width > cur.width) {
                return cur
            }
        }

        return cur
    }, null) as photoSize
}