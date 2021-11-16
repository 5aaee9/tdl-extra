import cheerio from 'cheerio'
import {
    formattedText, textEntity, 
} from 'tdlib-types'
import { Element } from 'domhandler'

export function buildRawText(input: string): formattedText {
    return {
        _: 'formattedText',
        text: input,
        entities: [],
    }
}

export function htmlFormatted(input: string): formattedText {
    if (input.length === 0) {
        return {
            _: 'formattedText',
            text: '',
            entities: [],
        }
    }

    const html = cheerio.load(input)
    const entries = [ ...cheerio.parseHTML(input).entries() ]
        .map(([, node]) => node)

    let text = ''
    let pos = 0
    const entities: textEntity[] = []

    for (const entry of entries) {
        const data = entry as Element

        const entryText = html(data).text()

        text += entryText

        const base: {
            _: 'textEntity'
            offset: number
            length: number
        } = {
            _: 'textEntity',
            offset: pos,
            length: entryText.length,
        }


        if (data.type === 'tag' && data.name === 'b') {
            entities.push({
                ...base,
                type: {
                    _: 'textEntityTypeBold',
                },
            })
        }

        if (data.type === 'tag' && data.name === 'code') {
            entities.push({
                ...base,
                type: {
                    _: 'textEntityTypeCode',
                },
            })
        }

        if (data.type === 'tag' && data.name === 'a') {
            entities.push({
                ...base,
                type: {
                    _: 'textEntityTypeTextUrl',
                    url: html(data).attr('href') || '',
                },
            })
        }

        pos += entryText.length
    }

    return {
        _: 'formattedText',
        text,
        entities,
    }
}

export function formattedText2HTML(txt: formattedText): string {
    const parts: string[] = []

    let lastPos = 0

    if (txt.entities.length === 0) {
        return txt.text
    }

    for (const entity of txt.entities) {
        const src = txt.text.substring(lastPos, entity.offset)

        parts.push(src)

        if (entity.type._ === 'textEntityTypeCode') {
            parts.push('<code>')
        }

        if (entity.type._ === 'textEntityTypeTextUrl') {
            parts.push(`<a href="${entity.type.url}">`)
        }

        if (entity.type._ === 'textEntityTypeBold') {
            parts.push('<b>')
        }

        const content = txt.text.substr(entity.offset, entity.length)

        parts.push(content)
        lastPos = entity.offset + entity.length

        if (entity.type._ === 'textEntityTypeCode') {
            parts.push('<code/>')
        }

        if (entity.type._ === 'textEntityTypeTextUrl') {
            parts.push('</a>')
        }

        if (entity.type._ === 'textEntityTypeBold') {
            parts.push('</b>')
        }
    }

    parts.push(txt.text.substr(lastPos))

    return parts.join('')
}