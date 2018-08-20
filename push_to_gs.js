var fs = require('fs');
var path = require('path');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = __dirname + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_id.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the Google Sheets API
  authorize(JSON.parse(content), updateCandidats);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token), error => {
      if (error) {
        console.log(error)
      } else {
        console.log('Token stored to ' + TOKEN_PATH);
      }
    })
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }

}


// HELP https://developers.google.com/sheets/api/
function updateCandidats(auth) {
  var sheets = google.sheets('v4');

  var users = JSON.parse(fs.readFileSync('AllIn.json', 'utf8'))
  var userKeys = require('./config.js').tableHeaders.Informaticiens.keys
  var spreadSheetsHeader = require('./config.js').tableHeaders.Informaticiens.headersSS

  // console.log(users)

  // READ https://developers.google.com/sheets/api/guides/batchupdate
  // To create headers based on the tableHeaders in config.js
  // TODO: should be possible to make the update in one shot, see https://developers.google.com/sheets/api/guides/values
  sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: '1ErolkP45JGHp2R006OWZykafEYJGS4loVWDt3-i2-Vo',
    resource: {
      requests: {
        updateCells: {
          start: {
            sheetId: 0,
            rowIndex: 0,
            columnIndex: 0
          },
          rows: {
            values: spreadSheetsHeader.map(function (tKey) {
              return {
                userEnteredValue: { stringValue: tKey },
                userEnteredFormat: {
                  textFormat: { bold: true },
                  horizontalAlignment: "CENTER",
                  backgroundColor: {
                    red: 0.8,
                    green: 0.8,
                    blue: 0.8
                  }
                }
              }
            })
          },
          fields: '*',
        }
      }
    }
  })
  sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: '1CzpEds050P0x4YMNweg4JLHMb-ZS5UGoi39rQkwhnWA',
    resource: {
      requests: {
        updateCells: {
          start: {
            sheetId: 0,
            rowIndex: 1,
            columnIndex: 0
          },
          rows: users.Informaticiens.map(function (x) {
            return {
              values: userKeys.map(function (tKey) {
                switch (tKey) {
                  case "datePostulation":
                    // WORKS ONLY FOR OLD DATE FORMAT, e.g. 1-11-2016--05:43:43
                    // => 2016-11-02 05:43:43

                    // Date formating: https://developers.google.com/sheets/api/samples/formatting#set_a_custom_datetime_or_decimal_format_for_a_range
                    // Looks like it needs a range to apply to
                    /*var mydate = new Date(dateP);
                    var milliseconds = mydate.getTime();
                    return { userEnteredValue: { numberValue: milliseconds },
                             userEnteredFormat: { numberFormat: { type: "DATE", pattern: "mmm dd yyyy hh+:mm" }}
                         }*/

                    var dP = x[tKey].split('-');
                    var dateP = dP[2] + '-' + ('00' + dP[1]).substring(dP[1].length) + '-' + ('00' + dP[0]).substring(dP[0].length) + ' ' + dP[4];
                    return { userEnteredValue: { stringValue: dateP }, }
                  case 'filiere':
                    var metier = '';
                    switch (x[tKey]) {
                      case 'entreprise':
                        metier = 'Entreprise';
                        break;
                      case 'developpementApplications':
                        metier = 'Dev';
                        break;
                      case 'techniqueSysteme':
                        metier = 'TechSys';
                        break;
                      case 'neSaisPas':
                        metier = '?';
                        break;
                      default:
                        metier = 'NaN';
                    }
                    return { userEnteredValue: { stringValue: metier }, }
                  case 'addresseApprentiComplete':
                    return { userEnteredValue: { stringValue: x[tKey].rue + '\n' + x[tKey].NPA } }
                  case 'maturite':
                  case 'majeur':
                  case 'dejaCandidat':
                    return (x[tKey] == "true") ? { userEnteredValue: { stringValue: '✔' }, userEnteredFormat: { horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", backgroundColor: { red: 0.7, green: 1, blue: 0.7 } } } : { userEnteredValue: { stringValue: '⨯' }, userEnteredFormat: { horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", backgroundColor: { red: 1, green: 0.7, blue: 0.7 } } };
                  case 'genreApprenti':
                    return (x[tKey] == "Femme") ? { userEnteredValue: { stringValue: '♀' }, userEnteredFormat: { horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE" } } : { userEnteredValue: { stringValue: '♂' }, userEnteredFormat: { horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE" } };
                  case 'mailApprenti':
                    return { userEnteredValue: { formulaValue: '=HYPERLINK("mailto:' + x[tKey] + '";"' + x[tKey] + '")' } }
                  case 'connaissancesLinguistiques':
                    return { userEnteredValue: { stringValue: x[tKey].map(function (lg) { return lg }).join(", ") } }
                  case 'activitesProfessionnelles':
                  case 'stages':
                    return { userEnteredValue: { stringValue: x[tKey].map(function (empl) { return empl.employeur }).join('\n') } }
                  case 'annexes':
                    return { userEnteredValue: { stringValue: x[tKey].map(function (anx) { return anx }).join('\n') } }
                  case 'representants':
                  case 'scolarite':
                    return { userEnteredValue: { stringValue: "xxx" } }
                  default:
                    return { userEnteredValue: { stringValue: x[tKey] } }
                }
              })
            }
          }),
          fields: '*'
        }
      }
    }
  })
}
