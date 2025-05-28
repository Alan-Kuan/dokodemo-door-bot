enum InTagStrState { NONE, SINGLE, DOUBLE };

export type Tag = { name: string, pos: number };

function isAscii(char: string) {
    const code = char.charCodeAt(0);
    return 0 <= code && code <= 127;
}

// NOTE: '<' and '>' may also appear in <code> and <pre>, but these cases
// are considered rare and thus omitted
export function paginate(html: string, max_char: number, unclosed_tags: Tag[]) {
    let prefix = '';
    for (const tag of unclosed_tags) prefix += `<${tag.name}>`;

    let tag_start = false;
    // there might be '<' and '>' inside a string inside a tag,
    // and we have to ignore them
    let in_tag_str_state = InTagStrState.NONE;

    let tag_start_idx = -1;
    let tag_name = '';
    let tag_name_confirmed = false;

    let end_idx = 0;
    let char_count = 0;

    for (const char of html) {
        end_idx++;

        switch (char) {
        case '<':
            // '<' inside a string of an attribute of a tag is ignored
            if (in_tag_str_state !== InTagStrState.NONE) continue;

            if (tag_start) {
                throw new Error('Invalid HTML string');
            } else {
                tag_start = true;
                tag_start_idx = end_idx - 1;
            }
            continue;

        case '>':
            // '>' inside a string of an attribute of a tag is ignored
            if (in_tag_str_state !== InTagStrState.NONE) continue;

            if (tag_start) {
                if (tag_name[0] == '/') {
                    unclosed_tags.pop();
                } else {
                    unclosed_tags.push({
                        name: tag_name,
                        pos: tag_start_idx,
                    });
                }

                tag_start = false;
                tag_name = '';
                tag_name_confirmed = false;
            } else {
                throw new Error('Invalid HTML string');
            }
            continue;

        case '\'':
            // we only care about strings in a tag
            if (!tag_start) break;

            switch (in_tag_str_state) {
            case InTagStrState.NONE:
                in_tag_str_state = InTagStrState.SINGLE;
                break;
            case InTagStrState.SINGLE:
                in_tag_str_state = InTagStrState.NONE;
                break;
            }
            continue;

        case '"':
            // we only care about strings in a tag
            if (!tag_start) break;

            switch (in_tag_str_state) {
            case InTagStrState.NONE:
                in_tag_str_state = InTagStrState.DOUBLE;
                break;
            case InTagStrState.DOUBLE:
                in_tag_str_state = InTagStrState.NONE;
                break;
            }

            continue;

        case ' ':
            if (!tag_start) break;
            // a tag's name is the string after '<' and before the first whitespace
            tag_name_confirmed = true;
            continue;

        default:
            if (!tag_start) break;
            if (!tag_name_confirmed) tag_name += char;
            continue;
        }

        // if we let it keep consuming the html string, then it is possible that
        // `char_count` already becomes `max_char` here
        if (char_count == max_char) break;

        if (++char_count == max_char) {
            // if stops just before an end tag, keep consuming the html string
            if (end_idx + 1 < html.length && html[end_idx] == '<' && html[end_idx + 1] == '/') {
                continue;
            }
            break;
        }
    }

    if (end_idx == html.length) {
        return {
            paginated_html: prefix + html.slice(0, end_idx),
            end_idx,
            unclosed_tags: [] as Tag[],
        };
    }

    // If ends at an uncomplete word, retreat to previous word.
    if (isAscii(html[end_idx]) && html[end_idx] !== '<' && html[end_idx] !== ' ') {
        while (html[--end_idx] !== ' ');
    }

    let tag_end_idx = 0;

    // if ends inside an unclosed <a>, retreat to the word before <a>
    for (const tag of unclosed_tags) {
        if (tag.name == 'a') {
            end_idx = tag.pos;
            break;
        }
        tag_end_idx++;
    }

    let paginated_html = prefix + html.slice(0, end_idx);

    // if ends inside other unclosed tags, close the tag immediately
    for (let i = tag_end_idx - 1; i >= 0; i--) {
        const unclosed_tag = unclosed_tags[i];
        paginated_html += `</${unclosed_tag.name}>`;
    }

    // because we close the tag immediately, we should pass the opening tags to the next page
    return {
        paginated_html,
        end_idx,
        unclosed_tags: unclosed_tags.slice(0, tag_end_idx),
    };
}
