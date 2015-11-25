#!/usr/bin/env node
/*
Show that require()'s cache is by reference
node ./index.js
*/

// require a file
var data = require('./data.json')

// run a file that echos the data on an interval to see if it changes
require('./show_data_interval')

// edit response from that file
data['Will I exist if required by another file?'] = 'Yes!'

// run a subsequent file that requires the original file and echos the result
require('./show_data_now')
