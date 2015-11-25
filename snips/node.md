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



### require() Caches By Reference
<!--
If you change the properties/value of an object returned/fetched by require(), does that changed value persist?
Will a modified property of an object returned by require() exist if subsequently require()d by separate file?
-->
```
# @todo: write example
# @todo: link to subfolder example: node ./require_caches_by_reference/index.js
```



### process.nextTick() Beats setTimeout(...,0)
@todo
<!--
@todo: write subfolder example
	have a file that setTimeout(0)s before process.nextTick()ing
	run this file 1000 times and record that nextTick() fires first each time
-->
```
# @todo
```