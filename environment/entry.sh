#!/usr/bin/env bash
# set -e

if [ "$1" = 'dev' ]
then

    npm install
    npm run serve:dev

elif [ "$1" = 'test' ]
then

    npm install
    npm run test:watch

elif [ "$1" = 'coverage' ]
then

    npm install
    npm run coverage

elif [ "$1" = 'lint' ]
then

    npm install
    npm run lint:fix

elif [ "$1" = 'docs' ]
then

    npm install
    npm run docs  

elif [ "$1" = 'prod' ]
then
    
    npm run serve:prod

else

    exec "$@"

fi
