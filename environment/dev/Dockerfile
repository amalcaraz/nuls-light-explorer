FROM node:10.15
LABEL MANTAINER="Angel Manzano <amalcaraz89@gmail.com>"

# Update system dependencies
RUN apt-get update && \
    apt-get -y install \
    vim \
    sudo \
    apt-transport-https

# Install yarn (Already installed in node image)
# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
# RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
# RUN sudo apt-get update && sudo apt-get -y install yarn

# Install app dependencies
WORKDIR /code
# ADD package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build:ts

# USER node

EXPOSE 3000
EXPOSE 9229
ENTRYPOINT [ "./environment/entry.sh" ]
CMD ["dev"]
