#!/usr/bin/env bash
# set -e

npm install

if [ "$1" = 'dev' ]
then

    npm run serve:dev

elif [ "$1" = 'test' ]
then

    npm run test:watch

elif [ "$1" = 'coverage' ]
then

    npm run coverage

elif [ "$1" = 'lint' ]
then

    npm run lint:fix

elif [ "$1" = 'docs' ]
then

    npm run docs  

elif [ "$1" = 'prod' ]
then
    
    npm run serve:prod

else

    exec "$@"

fi
