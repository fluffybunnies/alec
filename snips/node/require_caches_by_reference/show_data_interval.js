
var data = require('./data.json')

console.log('show_data_interval', 'initial', data)

process.nextTick(function(){
	console.log('show_data_interval', 'nextTick', data)
})

setTimeout(function(){
	console.log('show_data_interval', 'setTimeout', data)
},0)
