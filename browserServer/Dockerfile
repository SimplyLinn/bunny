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
RUN apt-get update && apt-get -y install firefox-esr

RUN mkdir -p /var/run/dbus

#=================================
# Audio
#=================================
RUN apt-get update && apt-get -y install pulseaudio socat alsa-utils

USER viewer

RUN mkdir ~/renderServer

WORKDIR /home/viewer/renderServer

COPY package.json package-lock.json ./
RUN npm ci
COPY pulseaudio.sh ./pulseaudio.sh
COPY src/ ./src
USER root
RUN chown -R viewer:viewer .
USER viewer
RUN ls -la
ENTRYPOINT [ "npm", "start", "--" ]