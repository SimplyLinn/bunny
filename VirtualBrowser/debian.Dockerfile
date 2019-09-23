FROM node:12.10-slim
USER root

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

#============================================
# Browsers
#============================================
RUN apt-get update && apt-get -y install firefox-esr

RUN mkdir -p /var/run/dbus

#=================================
# Audio
#=================================
RUN apt-get update && apt-get -y install pulseaudio socat alsa-utils consolekit
# Workaround. See: http://blog.tigerteufel.de/?p=476
RUN mkdir /tmp/.X11-unix
RUN chmod 1777 /tmp/.X11-unix
RUN chown root /tmp/.X11-unix/

COPY package.json ./
RUN yarn
# Ensure file is executable
COPY pulse-config.pa /bin
COPY .babelrc ./
COPY src/ ./src

# ENTRYPOINT ["bash"]
ENTRYPOINT [ "npm", "start", "--" ]