const { IMG_SRCS } = require('./misc.js');

const templates = {
    [IMG_SRCS.wikimedia_commons]: {
        'image': date => `{{Potd/${ date }}}`,
        'caption': date => `{{Potd/${ date } (en)}}`,
    },
    [IMG_SRCS.wikipedia_en]: {
        'image': date => `{{POTD/${ date }|image}}`,
        'caption': date => `{{POTD/${ date }|caption}}`,
    },
};

function getTemplate(date,src, type) {
    return templates[src][type](date);
}

module.exports = { getTemplate };
