const {google} = require('googleapis');
const keys = require('./data/gsapikeys.json');
const { type } = require('os');
require('dotenv').config()

const sheet_spot = process.env.SHEET_SPOT;
const sheet_date = shiftLastLetter(sheet_spot, 1);

const client = new google.auth.JWT(
    keys.client_email, 
    null, 
    keys.private_key, 
    ["https://www.googleapis.com/auth/spreadsheets"]
);

async function checkGoogleSheet(dec){
    client.authorize(function(err, tokens){
        if(err){
            console.log(err);
            return;
        } else {
            console.log("Connected to google sheet");
            gsrun(client, dec);
        }
    });
    console.log('DONE')
}

function shiftLastLetter(str, shiftBy){
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
    console.log(todaysDate);
    return todaysDate;
}

async function gsInfoUpdate(cl, target, API, newDate, darkcry){
    const updateDec = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheet_spot}${target}`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[darkcry]]}
    }
    const updateCell = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheet_spot}1`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[target + 1]]}
    }
    const updateDate = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheet_date}1`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[newDate]]}
    }
    try {
        //update dec mark and update number
        API.spreadsheets.values.update(updateDec); 
        API.spreadsheets.values.update(updateCell);
        API.spreadsheets.values.update(updateDate);
    }
    catch {
        console.log('something went wrong when updating google sheets')
    }

}

async function gsrun(cl, darkcrystals) {
    const gsAPI = google.sheets({ version: 'v4', auth: cl });
    const dateInfo = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: `${sheet_date}1`
    }
    let currentdate = await todaysDate();
    let exceldate = await gsAPI.spreadsheets.values.get(dateInfo);

    console.log(currentdate)
    if(currentdate != exceldate.data.values[0][0]){
        console.log('Updating the spreadSheet');
        const targetInfo = {
            spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
            range: `${sheet_spot}1`
        }
        let getTarget = await gsAPI.spreadsheets.values.get(targetInfo);
        gsInfoUpdate(cl, parseInt(getTarget.data.values[0][0], 10), gsAPI, currentdate, darkcrystals);
    } else {
        console.log('No Sheet Update Needed');
    }
}

exports.checkGoogleSheet = checkGoogleSheet;