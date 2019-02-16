FROM node:10.15

# Move to build dir
WORKDIR /usr/src/app

# Install app dependencies
ADD package*.json ./
RUN npm install
RUN npm cache clean --force

ENV NODE_ENV production

# Build the app
COPY . .
RUN npm run build:ts

EXPOSE 80
EXPOSE 9229
ENTRYPOINT [ "./environment/entry.sh" ]
CMD ["prod"]