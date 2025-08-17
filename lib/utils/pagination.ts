enum InTagStrState { NONE, SINGLE, DOUBLE };

function isAscii(char: string) {
    const code = char.charCodeAt(0);
    return 0 <= code && code <= 127;
}

// NOTE: '<' and '>' may also appear in <code> and <pre>, but these cases
// are considered rare and thus omitted
export function paginate(html: string, max_char: number, unclosed_tags: string[]) {
    let prefix = '';
    for (const tag of unclosed_tags) prefix += `<${tag}>`;

    let tag_start = false;
    // there might be '<' and '>' inside a string inside a tag,
    // and we have to ignore them
    let in_tag_str_state = InTagStrState.NONE;

    let tag_beg_idx = -1;
    let tag_name = '';
    let tag_name_confirmed = false;

    let end_idx = 0;
    let char_count = 0;

    let a_tag_begs: number[] = [];

    for (const ch of html) {
        end_idx++;

        switch (ch) {
        case '<':
            // '<' inside a string of an attribute of a tag is ignored
            if (in_tag_str_state !== InTagStrState.NONE) continue;

            if (tag_start) {
                throw new Error('Invalid HTML string');
            } else {
                tag_start = true;
                tag_beg_idx = end_idx - 1;
            }
            continue;

        case '>':
            // '>' inside a string of an attribute of a tag is ignored
            if (in_tag_str_state !== InTagStrState.NONE) continue;

            if (tag_start) {
                if (tag_name[0] == '/') {
                    unclosed_tags.pop();
                } else {
                    unclosed_tags.push(tag_name);
                    // record beginning position of an <a> tag
                    if (tag_name === 'a') {
                        a_tag_begs.push(tag_beg_idx);
                    }
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
            if (!tag_name_confirmed) tag_name += ch;
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

    // assume no unclosed tags in the given html string
    if (end_idx == html.length) {
        return {
            paginated_html: prefix + html,
            end_idx,
            unclosed_tags: [] as string[],
        };
    }

    let end_idx_old;
    do {
        end_idx_old = end_idx;
        // If ends at an uncomplete word, retreat to its previous word.
        end_idx = retreatToPrevWord(html, end_idx, unclosed_tags);

        // If ends inside an unclosed <a>, retreat to the word just before <a>
        // because it will be complicated to find out the value of "href"
        // starting from the next page.
        end_idx = retreatToATagStart(end_idx, unclosed_tags, a_tag_begs);
    } while (end_idx !== end_idx_old);

    let paginated_html = prefix + html.slice(0, end_idx);

    // if ends inside unclosed tags other than <a>, close the tag immediately
    for (let i = unclosed_tags.length - 1; i >= 0; i--) {
        paginated_html += `</${unclosed_tags[i]}>`;
    }

    // because we close the tag immediately, we should pass the opening tags to the next page
    return { paginated_html, end_idx, unclosed_tags };
}

// NOTE: unclosed_tags may be modified in this function
function retreatToPrevWord(html: string, end_idx: number, unclosed_tags: string[]): number {
    if (!isAscii(html[end_idx]) || html[end_idx] === ' ') {
        return end_idx;
    }
    // for example, in the case <b>|<i>... should retreat to |<b><i>...
    if (html[end_idx] === '<' && end_idx > 0 && html[end_idx - 1] !== '>') {
        return end_idx;
    }

    while (--end_idx >= 0) {
        // the end of the previous word is found
        if (html[end_idx] === ' ') break;
        if (html[end_idx] !== '>') continue;

        // find the tag name aggressively whenever encounters a tag
        let tag_name = '';
        let tag_beg_idx = end_idx;
        let in_tag_str_state = InTagStrState.NONE;

        // find the begin of the tag
        loop: while (--tag_beg_idx) {
            switch (html[tag_beg_idx]) {
            case '<':
                if (in_tag_str_state !== InTagStrState.NONE) continue;
                break loop;
            case '\'':
                switch (in_tag_str_state) {
                case InTagStrState.NONE:
                    in_tag_str_state = InTagStrState.SINGLE;
                    break;
                case InTagStrState.SINGLE:
                    in_tag_str_state = InTagStrState.NONE;
                    break;
                }
                break;
            case '"':
                switch (in_tag_str_state) {
                case InTagStrState.NONE:
                    in_tag_str_state = InTagStrState.DOUBLE;
                    break;
                case InTagStrState.DOUBLE:
                    in_tag_str_state = InTagStrState.NONE;
                    break;
                }
                break;
            }
        }

        // NOTE: we don't have to worry about single tags like <br/>
        // because sanitizeHTML() removes them.
        for (const ch of html.slice(tag_beg_idx + 1, end_idx)) {
            // the tag may look like <a >, < i> or </ b>
            if (ch === ' ') {
                if (tag_name.length === 0 || tag_name === '/') continue;
                break;
            }
            tag_name += ch;
        }

        // closing tag
        if (tag_name[0] === '/') {
            unclosed_tags.push(tag_name.slice(1));
        // opening tag
        } else {
            unclosed_tags.pop();
        }

        end_idx = tag_beg_idx;
    }

    return Math.max(end_idx, 0);
}

// NOTE: unclosed_tags may be modified in this function
function retreatToATagStart(end_idx: number, unclosed_tags: string[], a_tag_begs: number[]): number {
    let tag_end_idx = 0;

    for (const tag of unclosed_tags) {
        if (tag == 'a') {
            let l = 0, r = a_tag_begs.length - 1;

            while (l <= r) {
                const m = Math.floor((l + r) / 2);
                if (a_tag_begs[m] <= end_idx) {
                    l = m + 1;
                } else {
                    r = m - 1;
                }
            }

            end_idx = a_tag_begs[r];
            unclosed_tags.splice(tag_end_idx);
            break;
        }
        tag_end_idx++;
    }

    return end_idx;
}
