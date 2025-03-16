#! /usr/bin/env bash

rm assets/{app.css,index.js,index.js.map}

npm run build:client:css

cp assets/* build/

HASH=$(sha256sum build/index.js | awk '{print $1}')
mv build/index.js build/$HASH.index.js

sed -i "s/index.js/\/$HASH.index.js/g" build/index.html

HASH=$(sha256sum build/app.css | awk '{print $1}')
mv build/app.css build/$HASH.app.css

sed -i "s/app.css/\/$HASH.app.css/g" build/index.html
