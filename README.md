# Nuls light explorer
====================

### Requirements

- [Node.js](https://nodejs.org/es/) >= v10.15.0 (npm v6.4.1)

## Using this package

Clone the project: 
```bash 
  # Clone the project  
  git clone <repository.git> nuls-light-explorer
  cd nuls-light-explorer 
``` 

### Installation

Once you have downloaded:

```bash
  # with npm
  npm install 
  nnpm run build:ts 
  npm run serve:prod 

  # or using yarn
  yarn install
  yarn run build:ts   
  yarn run serve:prod 
```

With [docker](https://www.docker.com/): 
```bash 
  # Build the docker image 
  docker build -f environment/prod/Dockerfile -t nuls-light-explorer . 
  # Run the docker container 
  docker run -d -it --name nuls-light-explorer -p 80:3000 nuls-light-explorer 
``` 

### Setting up the service 

Once the installation of the service have finished, we need to fix some environment vars. You can find all environment vars  
availables to configure the service in `config/custom-environment-variables.yaml`. 

An example of configuration of the most important vars:
```bash  
# Service port:
export NLE_SERVER_PORT="3000"

# Nuls rpc node:
export NLE_NULS_HOST="http://localhost:8001"

# Level db path:  
export NLE_LEVEL_PATH="/data/nuls-light-explorer"
```

### Contribution guidelines 
 
If you are thinking in contribute to the project you should know that: 
 
- The code has been written following the [clean architecture principles](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html), as well as [SOLID design principles](https://es.wikipedia.org/wiki/SOLID). 
 
- The project is built in [typescript](https://www.typescriptlang.org/) v2.9.2 using the [recommended guidelines](https://github.com/palantir/tslint/blob/master/src/configs/recommended.ts). Also there is a linter rules configured to follow this guidelines, so you can search for a plugin for your favourite IDE to be warned about this linter errors. 
first version of docs