// node ~/Downloads/async.bad.js

var numThingsToDoAsync = 0

++numThingsToDoAsync
getFood('Skinny Bitch', function(){
	doneWithAsyncTask()
})

++numThingsToDoAsync
getDrink('Skinny Bitch', function(){
	doneWithAsyncTask()
})

function doneWithAsyncTask(){
	if (--numThingsToDoAsync == 0) {
		console.log('READY TO EAT LUNCH!')
	}
}

function getFood(restaurant, cb){
	if (restaurant == 'Skinny Bitch') {
		return cb('Error: Skinny Bitch is closed :(')
	}
	requestFoodFromRestaurant(restaurant, function(food){
		cb(false, food)
	})
}

function getDrink(restaurant, cb){
	process.nextTick(function(){
		cb(false, 'Diet Coke')
	})
}
