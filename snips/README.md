# snips


## To Do
- Come up with better name + domain
- Format
	- Split by language?
	- Searchable keywords
- Migrate to own repo
- Places to check
	- ace (ut.js), alec_repo (utils/), .profile, diff.sh, lucky-forwarder, lucky-bak, immediate_todo-alec.txt
- Create pretty blog-type website powered by these files
	- find cool wordpress theme, set up repo + sire + todo doc (or instead...*)
		- keyword/label it up! parent web page could have php,css,html5,bash,shell,etc
		- what i want
			- sleek, simple, dark, easy-to-read body text
			- extendable top nav for each language
			- comments under each page
			- obvious search bar on each page, most prominent on hp
			- responsive design
			- bonus: formatted code blocks
		- options
			- http://themeforest.net/item/manual-best-online-documentation/full_screen_preview/12997044
			- http://themeforest.net/item/basic-ultraclean-responsive-wordpress-theme/full_screen_preview/4345245
			- http://www.elegantthemes.com/gallery/trim/
			- http://www.elegantthemes.com/gallery/askit/
			- http://www.elegantthemes.com/gallery/businesscard/
			- http://www.elegantthemes.com/gallery/puretype/
				- With color theme + font updates
			- http://themeforest.net/item/uncode-creative-multiuse-wordpress-theme/full_screen_preview/13373220 (creative freelance)
			- http://themeforest.net/item/qanda-wp-questions-and-answers/4524028
				- http://themeforest.net/item/qanda-wp-questions-and-answers/full_screen_preview/4524028
			- http://themeforest.net/item/evoke-wordpress-theme/full_screen_preview/11827132
				- icon lib
	- *...make the site yourself using Ace
		- might actually be faster/easier than using WP, plus faster + more impressive
		- find the mock i drew up; had some cool ideas on it
		- make sure to 
		- link to npm ace in footer
		- security: prevent xss and all that
	- design cool logo
	- design cool tagline
	- big search bar on top of homepage (and probs every page)
	- make sure topics are easy to browse without having to search
		- nicely formatted/navigable listings
			- navigable: you know what language you are interested in most likely, so that should be first. follow this pattern as you click


<!--

- - - WISHLIST - - -

pv (apt-get install pv)
	pv /tmp/db.bak.sql | mysql -h... -u... -p... db

disk space
	ls -lh
	mounts/file systems: df -v
	files: du -skh *
		du -skh * | sort

var a; getStuff(function(a){ doStuff(); }); function doStuff(){ console.log('a',a); }

- find bigQuery or bigInsert method i made
	- along the lines of whats going on in packages/datalogix/mage.js and packages/datalogix/insertoffers.js

grepl (grep last N lines of a file)

git log ":(exclude)"
	git --no-pager diff 20150805l_release..20150821q_release -- . ":(exclude)vendor" ":(exclude)data/" ":(exclude)lib/"

tr (adding/removing newlines)

how to echo to stderr

apropos
	e.g. `apropos split`

php vs js:
	$a = 1 ? 1 : 2 ? 2 : 3;
	$a = 1 ? 1 : (2 ? 2 : 3);


-->