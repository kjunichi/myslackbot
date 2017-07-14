FROM node:8-alpine
RUN apk update
RUN apk --update add cairo-dev git python alpine-sdk libjpeg-turbo-dev libpng-dev curl jq giflib-dev
RUN apk --update add tzdata && \
    rm -rf /var/cache/apk/*
ENV TZ Asia/Tokyo
ADD ./webapp /opt/webapp/
WORKDIR /opt/webapp

RUN npm install

RUN adduser -D myuser
RUN chown -R myuser /opt/webapp
USER myuser
RUN mkdir uploads
CMD npm start
