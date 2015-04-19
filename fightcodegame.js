
/*
	todo
		- make better movement pattern
			- benchmark jitter
		- dont fire if friendly is in path
		- can get stuck on wall
*/

var jitter = true;

function Robot(robot) {
	var z = this;
	z.tick = 0;
	z.robots = {};
	z.timeouts = {};
	z.spawnClones(robot);
	z.enemySpotted = null;
}

Robot.prototype.onIdle = function(ev) {
	var z = this
	,robot = ev.robot
	,robotHq = z.registerRobot(robot)
	,travelThisTick = 2
	if (robotHq.enemyLocked) {
		robot.fire();
		if (!robotHq.stoppedToFire) {
			robotHq.stoppedToFire = true;
			var uid = robotHq.enemyLockedUid
			,resume = function(){
				robotHq.enemyLocked = null;
				robotHq.stoppedToFire = false;
			}
			z.setTimeout(function(){
				if (robotHq.enemyLockedUid != uid)
					return;
				resume();
			},200);
			z.setTimeout(resume,300);
		}
	} else if (z.enemySpotted && z.enemySpotted.by != robot.id) {
		z.aim(robot,z.enemySpotted);
		z.enemySpotted = null;
	} else {
		if (jitter) {
			robotHq.jitterDistance = 
		} else {
		robot.ahead(2);
		robot.rotateCannon(3*robotHq.rotateCannonDir);
	}
	if (z.isClone(robot) && !robotHq.cloneRetreated) {
		robot.stop();
		robot.back(150);
		robot.turn(90);
		robotHq.cloneRetreated = true;
	}
	z.checkTimeouts(robot);
	++z.tick;
}

Robot.prototype.onRobotCollision = function(ev) {
	if (this.isAlly(ev.robot,ev.collidedRobot)) {
		ev.robot.back(75);
	} else {
		this.foundEnemy(ev.robot,ev.collidedRobot);
		this.aim(ev.robot,ev.collidedRobot.position);
	}
}

Robot.prototype.onWallCollision = function(ev) {
	var robot = ev.robot
	,dir = Math.round(this.rand(robot,0,1)) ? 1 : -1
	,deg = this.rand(robot,30,100);
	robot.turn(dir*deg);
}

Robot.prototype.onScannedRobot = function(ev) {
	if (!this.isAlly(ev.robot,ev.scannedRobot)) {
		this.foundEnemy(ev.robot,ev.scannedRobot);
		//ev.robot.stop();
		this.switchCannonRotation(ev.robot); // not sure this helps
	}
}

Robot.prototype.onHitByBullet = function(ev) {
	var robot = ev.robot
	,robotHq = this.registerRobot(robot)
	,deg = ev.bearing+robot.cannonRelativeAngle
	// todo: confirm this works
	//robot.log('SHOT!',ev.bearing,robot.cannonRelativeAngle,deg); 
	robotHq.rotateCannonDir = deg > 0 ? 1 : -1;

	if (robot.availableDisappears) {
		robot.disappear();
		robot.ahead(50);
	}
}




Robot.prototype.registerRobot = function(robot){
	if (!this.robots[robot.id]) {
		this.robots[robot.id] = {
			rotateCannonDir: robot.id.indexOf('1') == -1 ? -1 : 1
			,jitterDir: robot.id.indexOf('1') == -1 ? -1 : 1
		};
	}
	return this.robots[robot.id];
}

Robot.prototype.spawnClones = function(robot){
	for (var i=0;i<robot.availableClones;++i)
		robot.clone();
}

Robot.prototype.isAlly = function(self,target){ 
	return self.id == target.parentId || self.parentId == target.id; 
}

Robot.prototype.isClone = function(robot){
	return robot.parentId !== null;
}

Robot.prototype.foundEnemy = function(self,target){
	var robotHq = this.registerRobot(self);
	robotHq.enemyLocked = target;
	robotHq.enemyLockedUid = this.tick;
	this.enemySpotted = {
		by: self.id
		,x: target.position.x
		,y: target.position.y
	}
}

Robot.prototype.switchCannonRotation = function(robot){
	var robotHq = this.registerRobot(robot);
	robotHq.rotateCannonDir = robotHq.rotateCannonDir == 1 ? -1 : 1;
}

Robot.prototype.aim = function(robot,target){
	var x = target.x-robot.position.x
	,y = target.y-robot.position.y
	if (!x && !y)
		return;
	var deg = Math.atan(y/x)*(180/Math.PI)
	deg -= robot.cannonAbsoluteAngle - (x > 0 ? 180 : 0);
	while (Math.abs(deg) > 180)
		deg > 1 ? deg -= 360 : deg += 360;

	// faster with turn
	deg = deg/2;
	robot.turn(deg);
	// /faster with turn

	this.registerRobot(robot).rotateCannonDir = deg < 1 ? -1 : 1; // continue sweep
	robot.rotateCannon(deg);
}

Robot.prototype.rand = function(robot,min,max){
	// source: https://github.com/ianb/whrandom
	var seed = robot.position.x+robot.position.y+this.tick;
	var x = (seed % 30268) + 1;
	seed = (seed - (seed % 30268)) / 30268;
	var y = (seed % 30306) + 1;
	seed = (seed - (seed % 30306)) / 30306;
	var z = (seed % 30322) + 1;
	seed = (seed - (seed % 30322)) / 30322;
	x = (171 * x) % 30269;
	y = (172 * y) % 30307;
	z = (170 * z) % 30323;
	var r = (x / 30269.0 + y / 30307.0 + z / 30323.0) % 1.0;
 	return r*(max-min)+min; 
}

Robot.prototype.setTimeout = function(cb,t){
	var id = this.lastTimeoutId ? this.lastTimeoutId+1 : 1;
	this.timeouts[id] = {
		end: this.tick+t
		,cb: cb
	}
	return this.lastTimeoutId = id;
}

Robot.prototype.clearTimeout = function(id){
	delete this.timeouts[id];
}

Robot.prototype.checkTimeouts = function(){
	for (var id in this.timeouts) {
		if (this.tick >= this.timeouts[id].end) {
			this.timeouts[id].cb();
			delete this.timeouts[id];
		}
	}
}
