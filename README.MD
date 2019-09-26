# Turt.us

A self-hosted rabb.it clone using docker forked from [bunny by SimplyLin](https://github.com/SimplyLinn/bunny)

Features
- Control a virtual stateless firefox browser served via docker
- Create user accounts and chat rooms
- Voice and video chat over p2p, text chat over not p2p 

## Deploying

For now these steps only cover deploying using [AWS EC2](https://aws.amazon.com/ec2/).
You receive 750 free hours of EC2 permonth for 12 months which is more than enough for this project.
The exact cost of self-hosting is to be determined.

There may be extra work/different charges in deploying to a different cloud based service.
Running the container locally is covered later.


## Running Locally

Although it defeats the purpose of this project, you can run the entire thing locally in very little time. Warning: this resource intensive project may shorten your computer's lifespan.

First ensure you have docker, node, and yarn installed with:

```sh
docker -v 
# Docker version xx.xx.x, build xxxxxxx
node -v 
# vXX.X.X
yarn -v
# x.xx.x
```
### Build the docker image

```sh
# in your favorite terminal application
cd ./services/virtual-browser
# build
yarn build:docker
```

The will create an image named `virtual-browser`. If you would like to name it something else, then just run the normal docker commands and make sure to set the image name in the configuration.

### Step 2

Run the server.
First start the server. This will expose a port on the local machine.
The signal server requires certificates in order for the virtual-browser to connect to it.
Probably will use certbot to generate on the fly in the future.

Next start the client application.

Finally, start the docker container.

The docker container requires the url to a webrtc signaling server. 
Locally this will be: `wss://local-ip-address:PORT`

### Development / How Does It All Work

The tech stack consists of three key microservices:

#### 1. Virtual Browser

The Virtual Browser is a docker container based on a [dockernode image](https://hub.docker.com/_/node/) that manages a bunch of processes with the help of a not too complicated node script (bc js is cool).

Those important processes are as follows:

- dbus
  - Controls inter process communication. 
  - This is a dependancy of some of the following processes.
- Xvfb
  - Virtual Frame Buffer that implements X11 protocol.
  - Basically alows us to run graphical applications without an actual display attached
- xdotool
  - What allows  
- pulseaudio
  - A general purpose sound server.
  - Used to capture sound output from the container.
- ffmpeg
  - Records video and sound from
- firefox-esr
  - The web browser itself. 
  - Launched fullscreen and installed with ublock-origin (as soon as I figure out how)

The VirtualBrowser is intended to be launched dynamically from a script (i.e. the backend).

The container can be launched using a few arguments. 
- `-s, --signal-server <url>`  
  - The url to the signal server. See server sections for more details.
- `-t, --timeout <ms>`
  - Not yet implemented
  - The amount of time in ms the browser will wait after the last peer has disconnected before automatically shutting down. 
  - Defaults to `60000` (1 minute)

After launching the Virtual Browser and establishing the source for the media stream, a wrtc connection is made through the signalling server specifiec using the `-s` option. 

Whenever a peer connects they receive a copy of the stream via p2p and webrtc. 

The Virtual Browser can be shut down either by the client asking it nicely (i.e. sending a shutdown message) or by timing out due to a lack of peers as described above or by the signaling server itself shutting down.

#### 2. Server

The backend performs webrtc handshake negotiation and serves an api that is used to manage users and rooms. Unlike a traditional application the backend does not serve the web client. Why? Because I read an article on microservices once.

The backend is served over https only because Chrome requires a secure connection for webrtc. This means when developing locally you are required to have a certificate. You can use the one provided in the repository and simply accept the SSL error by navigating to 

For mac/linux there is a script `/gen_cert.sh` that you can run that will generate the cert and key, `localhost.cert` and `localhost.key` respectively. Double click on the `.cert` file to add it to your keychain / trusted ca. 

Windows users....use git bash or bash on windows.

*Note*: On mac you might have to go a bit futher by right clicking the certificate you just added to the keychain, click "get info", expand the "Trust" dropdown, then set "When using this certificate" to "Always Trust". 

Start server with:

```bash
yarn dev
```

Test the server is online with curl:

```bash
curl -k https://localhost/
# Returns the time the server received the request
```

#### 3. Client App(s)

For now there is only one client application: a responsive web application that connects to the virtual browser over p2p. 

The app is built using React.

## Emojis in Code? Why? 

They can convey meaning quickly without having to read. Here's a quick dictionary:
- 🙂Success
- 🤔Info / Warning 
- 👎Non-Fatal Error
- ☠️Fatal Error

## Connection Algorithm 

p2p connections are negotiated over the signal server and work as follows:

1. A client connects to the signal server via websocket url
2. The signal server sends the client an `identity` packet
  - This packet will be attached to every outgoing message. 
3. One or more clients subsequently connect to the websocket url 
4. The server negotiates the handshake between existing clients and the new client
5. All old clients ask the new client to identify their client type
6. If the client type is `vb` then a client must specifically ask for the stream by providing a `request.stream` packet.
7. Otherwise the client is automatically sent the stream.

## Resources

[Break monolith app into microservices](https://aws.amazon.com/getting-started/projects/break-monolith-app-microservices-ecs-docker-ec2/)

[Deploy Node.js application to AWS](https://www.freecodecamp.org/news/how-to-deploy-a-node-js-application-to-amazon-web-services-using-docker-81c2a2d7225b/)

[Making and trusting your own certificates](https://letsencrypt.org/docs/certificates-for-localhost/)

[Certbot certificate creation docker tutorial](https://techsparx.com/nodejs/docker/express-https.html)

[aws-js-api](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html#constructor-property)