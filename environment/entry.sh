#!/usr/bin/env bash
# set -e

yarn install

if [ "$1" = 'dev' ]
then

    yarn run serve:dev

elif [ "$1" = 'test' ]
then

    yarn run test:watch

elif [ "$1" = 'coverage' ]
then

    yarn run coverage

elif [ "$1" = 'lint' ]
then

    yarn run lint:fix

elif [ "$1" = 'docs' ]
then

    yarn run docs  

elif [ "$1" = 'prod' ]
then
    
    yarn run serve:prod

else

    exec "$@"

fi
