!#/usr/bin
cd dev-resources/
python3 -m http.server &
cd ../
json-server --watch dev-resources/db.json
