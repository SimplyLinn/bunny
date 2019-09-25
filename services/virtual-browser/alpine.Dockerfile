FROM node:12.10-alpine

USER root

RUN apk --no-cache add \
  gcompat make \
  xvfb xdotool x11vnc \
  dbus dbus-x11\
  firefox-esr

# TODO: Automate this bit
# RUN Xvfb :1 -screen 0 1024x768x16 &> xvfb.log
# ENV DISPLAY=:1.0

# RUN firefox -v

#=========
# Node setup
#=========
COPY package.json yarn.lock ./
RUN yarn
COPY .babelrc ./
COPY src/ ./src

ENTRYPOINT [ "npm", "start", "--" ]