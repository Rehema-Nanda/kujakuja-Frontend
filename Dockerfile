FROM node:16.13.1
WORKDIR /code
COPY . .
RUN npm install
# have to do a second one to fix resolutions
RUN npm install
RUN npm start
