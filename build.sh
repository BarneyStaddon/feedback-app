#!/bin/bash

# Exit on error
set -o errexit 

# js
minify --output src/js/iscroll-probe.min.js src/js/iscroll-probe.js
minify --output src/js/utils.min.js src/js/utils.js
minify --output src/js/Scrubber.min.js src/js/Scrubber.js
minify --output src/js/ObjectView.min.js src/js/ObjectView.js
minify --output src/js/main.min.js src/js/main.js

# css
minify --output src/css/skeleton.min.css src/css/skeleton.css
minify --output src/css/booty.min.css src/css/booty.css
minify --output src/css/timeline.min.css src/css/timeline.css

# concat js
concat-cli -f src/js/iscroll-probe.min.js src/js/utils.min.js src/js/Scrubber.min.js src/js/ObjectView.min.js src/js/main.min.js -o src/js/mol-timeline.js
# ... and css
concat-cli -f src/css/skeleton.min.css src/css/booty.min.css src/css/timeline.min.css -o src/css/mol-timeline.css

# copy build over
mkdir bin/js
mkdir bin/css
mkdir bin/images
cp src/index.html bin/

# strip dev css links
replace '<link rel="stylesheet" href="css/skeleton.css">' '' bin/index.html
replace '<link rel="stylesheet" href="css/booty.css">' '' bin/index.html
replace '<link rel="stylesheet" href="css/timeline.css">' '' bin/index.html
# add prod css link
replace '<!-- build css -->' '<link rel="stylesheet" href="css/mol-timeline.css">' bin/index.html 

# strip dev js links in index
replace '<script type="text/javascript" src="js/iscroll-probe.js"></script>' '' bin/index.html
replace '<script type="text/javascript" src="js/utils.js"></script>' '' bin/index.html
replace '<script type="text/javascript" src="js/Scrubber.js"></script>' '' bin/index.html
replace '<script type="text/javascript" src="js/ObjectView.js"></script>' '' bin/index.html
replace '<script type="text/javascript" src="js/main.js"></script>' '' bin/index.html 
# add prod css link
replace '<!-- build js -->' '<script type="text/javascript" src="js/mol-timeline.js"></script>' bin/index.html 

# TO DO - remove gaps with an HTML cleaner
cp src/js/mol-timeline.js bin/js/
cp src/css/mol-timeline.css bin/css/
cp -r src/images/* bin/images




