# Dredd Testing
This folder holds the API definition and the Dredd configurations for each environment.

To use Dredd:

Make sure you have Node and NPM installed.
$ npm install -g dredd

Initialize Dredd. Mind the privacy of API key.
$ dredd init -r apiary -j apiaryApiKey:{API-key} -j apiaryApiName:{API-key}

Run the test, reports appear here.
$ dredd
