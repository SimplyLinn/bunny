FROM node:dubnium-stretch-slim

#==============
# VNC and Xvfb
#==============
RUN apt-get update && \
  apt-get clean \
  && apt-get -y install \
    xvfb \
    xdotool \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

#========================
# Miscellaneous packages
# Includes minimal runtime used for executing non GUI Java programs
#========================
RUN apt-get update && \
    apt-get -qqy --no-install-recommends install \
    ca-certificates \
    unzip \
    wget \
    libgconf-2-4 \
    ffmpeg \
    gnupg2 \
    netcat \
    iputils-ping \
    openbox \
    x11-session-utils \
    dbus \
    dbus-x11 \
    sudo

#========================================
# Add normal user with passwordless sudo
#========================================
RUN useradd viewer --shell /bin/bash --create-home
RUN chown viewer:viewer /home/viewer
RUN echo viewer ALL=\(ALL\) NOPASSWD:ALL >> /etc/sudoers

USER root

#============================================
# Browsers
#============================================
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get -y install google-chrome-stable firefox-esr

RUN mkdir -p /var/run/dbus

#=================================
# Chrome Launch Script Modication
#=================================
#COPY chrome_launcher.sh /opt/google/chrome/google-chrome
#RUN chmod 755 /opt/google/chrome/google-chrome

USER viewer

RUN mkdir ~/renderServer

WORKDIR /home/viewer/renderServer


COPY package.json package-lock.json ./
RUN npm ci
COPY src/ ./src

ENTRYPOINT [ "npm", "start", "--" ]