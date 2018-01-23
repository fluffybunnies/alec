# css
There are more CSS snips in index.html


### Simulate background-size:cover on other elements (e.g. iframes)
Example below maintains a 16:9 ratio for background video
```
.videoIframeWrapper {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	pointer-events: none;
	overflow: hidden;
}
.videoIframeWrapper >iframe {
	width: 100vw;
	height: 56.25vw;
	min-height: 100vh;
	min-width: 177.77vh;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
```


### Vertical Text Overflow Ellipsis
Works on Chrome + Safari, other browsers will cut off without ellipsis
```
.vertical-text-overflow-ellipsis {
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	max-height: 2.9em; /* Adjust this to fit your line-height */
}
```

