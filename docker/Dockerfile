FROM ubuntu:bionic

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
    netcat

#========================================
# Add normal user with passwordless sudo
#========================================
RUN useradd viewer --shell /bin/bash --create-home
RUN chown viewer:viewer /home/viewer

USER root

#============================================
# Google Chrome
#============================================
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get -y install google-chrome-stable

#=================================
# Chrome Launch Script Modication
#=================================
COPY chrome_launcher.sh /opt/google/chrome/google-chrome
RUN chmod 755 /opt/google/chrome/google-chrome

# Following line fixes
# https://github.com/SeleniumHQ/docker-selenium/issues/87
RUN echo "DBUS_SESSION_BUS_ADDRESS=/dev/null" >> /etc/environment

USER viewer

WORKDIR /home/viewer

RUN echo "INSTALLED VERSIONS" \
  && apt-cache policy google-chrome-stable | grep Installed | sed -e "s/Installed/Chrome/"

ENTRYPOINT [ "/usr/bin/Xvfb", ":100", "-ac", "-listen", "tcp", "-screen", "0" ]