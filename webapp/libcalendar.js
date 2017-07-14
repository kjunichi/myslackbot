var google = require('googleapis');
var googleAuth = require('google-auth-library');

var buf = [];
getOurEvents = (cb) => {
  buf = [];

  // Load client secrets from a local file.
  const content = process.env['CALENDAR_SECRET'];
  if (content) {
    console.log("CALENDAR_SECRET.");
    authorize(JSON.parse(content), cb, listAllEvents);
  }
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with getting calendar data.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, cb, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  const token = process.env['CALENDAR_TOKEN'];
  if (token) {
    console.log("calendar_token from ENV.");
    oauth2Client.credentials = JSON.parse(token);
    callback(oauth2Client,cb);
  }
}

function listAllEvents(auth,cb) {
  var calendar = google.calendar('v3');
  calendar.calendarList.list({
    auth: auth
  }, (err, res) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    //console.log(res.items);
    const numCals = res.items.length;
    var doneCals = 0;
    for (i = 0; i < res.items.length; i++) {
      var calId = res.items[i].id;
      var tday = new Date();
      var targetSec = tday.getTime() + (2 * 86400000);
      tday.setTime(targetSec);
      //console.log("get "+calId);
      //console.log(tday.toISOString());

      calendar.events.list({
        auth: auth,
        calendarId: calId,
        timeMin: (new Date()).toISOString(),
        timeMax: tday.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      }, (err2, res2) => {
        if (err2) {
          console.log('The API returned an error: ' + err2);
          return;
        }
        //console.log(res2);
        var events = res2.items;
        if (!events || events.length == 0) {
          //console.log('No upcoming events found. ');
          //console.log(res2);
        } else {
          //console.log('Upcoming events:');
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            buf.push(start + " " + event.summary);
            //console.log('%s - %s', start, event.summary);
          }
        }
        doneCals++;
        if (doneCals + 1 >= numCals) {
          return cb(buf);
        }
      });

    }
  });
}

exports.getOurEvents = getOurEvents;
