const { GoogleSpreadsheet } = require('google-spreadsheet');

const doc_id = process.env.GDOC_ID;
const sheet_id = '0';
const creds = require('../credentials.json');
const doc = new GoogleSpreadsheet(doc_id);
async function subscribe(chat_id) {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsById[sheet_id];
    const rows = await sheet.getRows();
    for(let row of rows) {
        // already subscribed
        if(row._rawData[0] === chat_id) {
            return false;
        }
    }
    await sheet.addRow([`'${chat_id}`]);
    return true;
}

async function unsubscribe(chat_id) {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsById[sheet_id];
    const rows = await sheet.getRows();
    for(let row of rows) {
        if(row._rawData[0] === chat_id) {
            await row.delete();
            return true;
        }
    }
    // have not subscribed
    return false;
}

async function getSubscribers() {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsById[sheet_id];
    const rows = await sheet.getRows();
    let subscribers = [];
    for(let row of rows) {
        subscribers.push(row._rawData[0]);
    }
    return subscribers;
}

module.exports = { subscribe, unsubscribe, getSubscribers };
