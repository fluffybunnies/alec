
/**
	Scenario: getUserById(userId,cb) is called by decoupled clients and we don't care
		about User data changing during this thread. onceify() inside getUser to ensure
		it executes a maximum of once concurrently per userId

	Example:
		If we set up getUser to look like:
			```
			var onceify = require('onceify')() // why we initialize via a function becomes obvious when dealing with multiple scopes
			function getUser(userId,cb){
				if (!(cb = onceify('getUser',userId,cb))) return // already working on it
				fetchFromDb('select * from users where id=?', [userId], function(err,rows){
					cb(err,rows)
				})
			}
			```
		Then if we were to run this:
			```
			getUser(11); getUser(12); getUser(11); getUser(11);
			```
		getUser() will only fetchFromDb() a total of two times: once for id 11, and once for id 12
*/
module.exports = function(){
	var onceifyCbs = {}
	return function(methodKey, methodUid, cb){
		onceifyCbs[methodKey] = onceifyCbs[methodKey] || {}
		;(onceifyCbs[methodKey][methodUid] = onceifyCbs[methodKey][methodUid] || []).push(cb)
		if (onceifyCbs[methodKey][methodUid].length > 1) {
			return false
		}
		return function(err,res){
			var cbs = onceifyCbs[methodKey][methodUid] || []
			delete onceifyCbs[methodKey][methodUid]
			cbs.forEach(function(cb){
				typeof cb == 'function' && cb(err,res)
			})
		}
	}
}

/**
	Scenario: insertPrimaryKeysTransactionally(customerEmail,cb) is expected to be called
		several times concurrently, but its underlying rdbms query protects itself by validly
		throwing deadlock errors when it can't resolve competing resource locks. We want
		insertPrimaryKeysTransactionally's contract to to ensure a non-error response unless
		that error is exceptional (e.g. db connection lost, not concurrency/race condition)

	Example:
		If we set up insertPrimaryKeysTransactionally to look like:
			```
			var sequential = require('onceify').sequential()
			MyDao.prototype.insertPrimaryKeysTransactionally = function(){
				sequential(this, this.insertPrimaryKeysTransactionallyQuery, 'insertPrimaryKeysTransactionally', arguments)
			}
			MyDao.prototype.insertPrimaryKeysTransactionallyQuery = function(arg1, arg2, ..., cb){
				writeToDb('start transaction; ... commit;',function(err,res){
					cb(err,res)
				})
			}
			```
		Then we guarantee that insertPrimaryKeysTransactionally() will writeToDb() one at a time
			regardless of the async nature of its client(s)
*/
module.exports.sequential = function(){
	var sequentials = {}
	return function(ref, method, methodUid, arguments){
		(sequentials[methodUid] = sequentials[methodUid] || []).push(arguments)
		if (sequentials[methodUid].length > 1) {
			return false
		}
		;(function next(){
			var args = sequentials[methodUid][0]
			if (!args) return;
			for (var i=args.length-1;i>=0;--i) {
				if (typeof args[i] == 'function') {
					var cb_ = args[i]
					args[i] = function(err,res){
						cb_(err,res)
						sequentials[methodUid].shift()
						next()
					}
					break
				}
			}
			method.apply(ref,args)
		}())
	}
}

