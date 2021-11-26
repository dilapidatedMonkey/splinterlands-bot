const {google} = require('googleapis');
const keys = require('./data/gsapikeys.json');
const { type } = require('os');

const client = new google.auth.JWT(
    keys.client_email, 
    null, 
    keys.private_key, 
    ["https://www.googleapis.com/auth/spreadsheets"]
);

async function checkGoogleSheet(sheet_spot, dec, ecr){
    client.authorize(function(err, tokens){
        if(err){
            console.log(err);
            return;
        } else {
            console.log("Connected to google sheet");
            gsrun(client, sheet_spot, dec, ecr);
        }
    });
}

async function shiftLastLetter(str, shiftBy){
    let newString = ''
    for (var i = 0; i < str.length; i++) {
        if(i == str.length - 1){
            newString += String.fromCharCode(str.charCodeAt(i) + shiftBy);
        } else {
            newString += String.fromCharCode(str.charCodeAt(i));
        }
        
    }
    return newString;
}

function todaysDate(){
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    const todaysDate = `${dd}-${mm}-${yyyy}`;
    return todaysDate;
}

async function updateECR(cl, API, ecr, sheetDate){
    const updateecrInfo = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheetDate}2`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[ecr]]}
    }
    try {
        await API.spreadsheets.values.update(updateecrInfo);
    } catch {
        console.log(`ECR value: ${ecr}, coloum trying to add to: ${sheetDate}`);
        console.log('something went wrong while trying to update ecr to google sheet');
    }
}

async function gsInfoUpdate(cl, target, API, newDate, darkcry, sheetSpot, sheetDate){
    const updateDec = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheetSpot}${target}`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[darkcry]]}
    }
    const updateCell = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheetSpot}1`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[target + 1]]}
    }
    const updateDate = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheetDate}1`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[newDate]]}
    }
    try {
        //update dec mark and update number
        await API.spreadsheets.values.update(updateDec); 
        await API.spreadsheets.values.update(updateCell);
        await API.spreadsheets.values.update(updateDate);
    }
    catch {
        console.log('something went wrong when updating google sheets')
    }
}

async function gsrun(cl, sheet_spot, darkcrystals, ecr) {
    // const sheet_spot = await process.env.SHEET_SPOT;
    const sheet_date = await shiftLastLetter(sheet_spot, 1);

    const gsAPI = google.sheets({ version: 'v4', auth: cl });
    const dateInfo = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheet_date}1`
    }
    let currentdate = await todaysDate();
    let exceldate = await gsAPI.spreadsheets.values.get(dateInfo);

    console.log(currentdate)
    if(ecr != ''){
        await updateECR(cl, gsAPI, ecr, sheet_date);
    } else {
        console.log('could not get ecr, did not update google sheets')
    }
    if(currentdate != exceldate.data.values[0][0]){
        console.log('Updating the spreadSheet');
        const targetInfo = {
            spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
            range: `${sheet_spot}1`
        }
        let getTarget = await gsAPI.spreadsheets.values.get(targetInfo);
        gsInfoUpdate(cl, parseInt(getTarget.data.values[0][0], 10), gsAPI, currentdate, darkcrystals, sheet_spot, sheet_date);
    } else {
        console.log('No Sheet Update Needed');
    }
}

// checkGoogleSheet(8008, '69%');

exports.checkGoogleSheet = checkGoogleSheet;