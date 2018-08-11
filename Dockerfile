FROM node:alpine
LABEL maintainer="zahir.gudino@gmail.com"

ARG WORK_DIR

RUN mkdir -p ${WORK_DIR}

WORKDIR ${WORK_DIR}

COPY package.json ${WORK_DIR}
COPY package-lock.json ${WORK_DIR}

ADD . ${WORK_DIR}

RUN npm install --only=production

CMD [ "npm", "start" ]