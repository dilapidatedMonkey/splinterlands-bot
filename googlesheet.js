const {google} = require('googleapis');
const { type } = require('os');
const keys = require('./data/gsapikeys.json');

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
}

//get this code to run at certain intervals using google sheets and update
//the google sheets accourding to the time frame
function randomNum(){
    return Math.floor(Math.random() * 100);
}

function todaysDate(){
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    const todaysDate = `${dd}-${mm}-${yyyy}`;
    console.log(todaysDate);
    return todaysDate;
}

async function gsInfoUpdate(cl, target, API, newDate, darkcry){
    randomVal = randomNum();
    const updateDec = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        //remember to change below to something dynamic and add it to the process.env
        range: `B${target}`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[darkcry]]}
    }
    const updateCell = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        //remember to change below to something dynamic and add it to the process.env
        range: `B1`,
        valueInputOption: 'USER_ENTERED',
        resource: {values: [[target + 1]]}
    }
    const updateDate = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        //remember to change below to something dynamic and add it to the process.env
        range: `C1`,
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
        console.log('something went wrong when update googe sheets(50)')
    }

}

async function gsrun(cl, darkcrystals) {
    const gsAPI = google.sheets({ version: 'v4', auth: cl });
    const dateInfo = {
        spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
        range: 'C1'
    }
    let currentdate = await todaysDate();
    let exceldate = await gsAPI.spreadsheets.values.get(dateInfo);

    console.log(currentdate, exceldate.data.values[0][0], type(currentdate), type(exceldate))
    if(currentdate != exceldate.data.values[0][0]){
        console.log('not the same, lemme update this bro');
        const targetInfo = {
            spreadsheetId: '1tbwo9fEawcDGZ7CZ9t5SEKi_2QM-Akwo7AT7aXymFBQ',
            range: 'B1'
        }
        let getTarget = await gsAPI.spreadsheets.values.get(targetInfo);
        console.log('heres my target', getTarget.data.values[0][0])
        gsInfoUpdate(cl, parseInt(getTarget.data.values[0][0], 10), gsAPI, currentdate, darkcrystals);
    } else {
        console.log('same date still, you may continue');
    }
}

exports.checkGoogleSheet = checkGoogleSheet;