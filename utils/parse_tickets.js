#!/usr/bin/env node
/*
To Do
	- /usr/bin/env node vs /usr/bin/node ?

*/







function spawn(cmd,args,cb){
	//return console.log(cmd+' "'+args.join('" "')+'"');
	var z = this, exitCode ,errs = [] ,outs = [] ,c = 3
	,proc = cp(cmd,args).on('exit',function(code){
		exitCode = code;
		done();
	});
	proc.stderr.on('data',function(data){
		errs.push(data);
	}).on('end',done);
	proc.stdout.on('data',function(data){
		outs.push(data);
	}).on('end',done);
	function done(){
		if (--c)
			return;
		var err = errs.length ? Buffer.concat(errs).toString() : ''
		,out = outs.length ? Buffer.concat(outs).toString() : ''
		;
		if (cb)
			cb(exitCode||false,out,err);
	}
}