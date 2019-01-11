# Nuls light explorer
====================

### Requirements

- [Node.js](https://nodejs.org/es/) >= v8.9.3 (npm v5.5.1)

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
  docker build -t nuls-light-explorer . 
  # Run the docker container 
  docker run -d -it --name nuls-light-explorer -p 80:80 nuls-light-explorer 
``` 

### Setting up the service 

Once the installation of the service have finished, we need to fix some environment vars. You can find all environment vars  
availables to configure the service in `config/custom-environment-variables.yaml`. 

An example of configuration of the most important vars:  
- Nuls rpc node: 
```bash  
  export NULS_CLIENT_NODE_HOST="http://localhost:8001"
```  
 
- Mongo ddbb host:  
```bash
  export NULS_LIGHT_EXPLORER_MONGO_HOST="localhost:27017"
  export NULS_LIGHT_EXPLORER_MONGO_DATABASE="explorer"
```  

### Contribution guidelines 
 
If you are thinking in contribute to the project you should know that: 
 
- The code has been written following the [clean architecture principles](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html), as well as [SOLID design principles](https://es.wikipedia.org/wiki/SOLID). 
 
- The project is built in [typescript](https://www.typescriptlang.org/) v2.9.2 using the [recommended guidelines](https://github.com/palantir/tslint/blob/master/src/configs/recommended.ts). Also there is a linter rules configured to follow this guidelines, so you can search for a plugin for your favourite IDE to be warned about this linter errors. 
first version of docs