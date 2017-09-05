# NodeJs
<!-- note somewhere that this is a subset of javascript -->


### require() Again
<!--
search google results for better title + keywords/subtitle, e.g.:
	How to remove module after "require" in node.js?
	How to re-require a module
I think I noted elsewhere in an @todo to have several varying questions as subtitles, and the title can be succinct
-->
Each individual file's response is cached globally, so you must delete each one you need removed from require's cache
```
delete require.cache[require.resolve('./config.js')]
delete require.cache[require.resolve('./config.local.json')]
```
The above would invalidate config.local.json but keep the original value of config.json if config.js looked like:
```
var sext = require('sext'), config = require('./config.json')
try {
  sext(config,require('./config.local.json'));
} catch(e){}
module.exports = config;
```



### ES5 Event Emitter Syntax
```
var EventEmitter = require('events')
,inherits = require('util').inherits

inherits(MyClass, EventEmitter);
function MyClass() {
	EventEmitter.call(this)
}

module.exports = MyClass
```



### Real string length (number of bytes)
Example: Verify won't get truncated when inserting into mysql db
```
Buffer.byteLength(str, 'utf8')
```



### Manual Garbage Collection
```
# @todo
```

