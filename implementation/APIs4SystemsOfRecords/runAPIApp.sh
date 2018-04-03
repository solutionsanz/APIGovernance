#export MONGODB_SERVER=mongo
#env | grep MONGO
cp swagger.yaml ../implementation/APIs4SystemsOfRecords/anki-sysrecords.yml
cd ../implementation/APIs4SystemsOfRecords
. setEnv.sh
node app.js
