# UI Setup

The UI is built using Oracle JET with TypeScript support.

## Pre-Requisites

+ Install Node & npm
  + Windows - https://nodejs.org/en/
  + MacOS - `brew install node`
+ Install Oracle JET CLI
  + `npm install -g @oracle/ojet-cli`
+ Install Typescript
  + `npm install -g typescript`
+ Install NPM Dependencies (Either or)
  + `ojet restore`
  + `npm i --also=dev`

## Starting the UI

You can run the UI in "watch" mode to automatically refresh when files are changed.

First you need to watch the TypeScript files with `tsc -w`

After this you'll need to start the UI and allow it to watch the JS/HTML files using the command `ojet serve`

This will start the UI running on port 8000.
