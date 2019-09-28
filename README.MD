# Turt.us

A self-hosted rabb.it clone using docker forked from [bunny by SimplyLin](https://github.com/SimplyLinn/bunny)

Features
- Control a virtual stateless firefox browser served via docker container
- Create user accounts and rooms
- Voice and video chat over p2p, text chat over not p2p 

For now this document only covers deploying using [AWS EC2](https://aws.amazon.com/ec2/)
and deploying locally.

**Note that this is a work-in-progress and the documentation in this readme is not complete. In fact, if you're an expert on AWS EC2 and can help me out I'd appreciate it**

## Running Locally

Running locally is useful for development purposes. 
Warning: this resource intensive project may shorten your computer's lifespan.

First ensure you have docker, node, and yarn installed with:

```sh
docker -v 
# Docker version xx.xx.x, build xxxxxxx
node -v 
# vXX.X.X
yarn -v
# x.xx.x
```

### Set dotenv conifguration

Copy `example.env` to a new file named `.env` in the project root.
By default this file is configured for a local development, so 

There are only a few variables you are required to set:
- `TURTUS_SERVER_DRIVER`
  - Keep this set to "local"
- `TURTUS_SERVER_DB_DRIVER`
  - 

Some variables are optional:
- `TURTUS_SERVER_PORT` - The port the server will start on.
- `TURTUS_SERVER_MAX_VB_INSTANCES` 
  - The maximum number of virtual browser instances that can be launched.
- `TURTUS_VB_DEFAULT_IDLE_TIMEOUT`
  - Set this to -1 to ensure the virtual browser doesn't time out

### Generate SSL Certificates

When running in HTTPS (the default) instead of HTTP, you'll need to generate some certificates. There is a bash script at `services/server/gen_cert.sh` that will automatically generate a certificate for localhost into the `services/server/config` folder.

*TODO: I meant to add those files to `.gitignore` but I forgot lol. I would reccomend not using the certificates in the repository and instead generating your own*

### Build the Virtual Browser docker image

```sh
# in your favorite terminal application
cd path/to/project/services/virtual-browser
# build
yarn docker-build
```
The will create an image locally named `turtus-browser`. 

### Run The Server

Run the server.
First start the server. This will expose a port on the local machine.
The signal server requires certificates in order for the virtual-browser to connect to it.
Probably will use certbot to generate on the fly in the future.

Next start the client application.

Finally, start the docker container.

The docker container requires the url to a webrtc signaling server. 
Locally this will be: `wss://local-ip-address:PORT`

## Deploy to AWS

You receive 750 free hours of EC2 permonth for 12 months which is more than enough to run
this project for a few friends.
The exact cost of self-hosting on AWS is still to be determined.

There may be extra work/different charges in deploying to a different cloud based service.

Running the container locally is covered further down.

### Set up AWS

If you don't already have a aws account sign up for one [here](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html)

Create a new IAM user on the aws dashboard [here](https://console.aws.amazon.com/iam/home#/users$new?step=details). You can find more details on that [here](https://docs.aws.amazon.com/en_pv/cli/latest/userguide/cli-chap-configure.html#cli-quick-configuration).

When prompted for the group, for now make sure the group has full access to EC2. 
If you're lazy like me you can simply select `AdministratorAccess` to give your user full access to everything.

Once you're at the success screen, take note of the Access Key ID and Secret Access Key.

If you don't already have the `aws-cli`, install it [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

p.s. the easiest way to install it is probably

```bash
pip install awscli
```

Now run the following line and follow the onscreen instructions. It will ask for the Access Key ID and Secret Access Key you (hopefully) took note of earlier.

```bash
aws configure
```

I would reccomend you use your closest region from [this-list](https://docs.aws.amazon.com/en_pv/general/latest/gr/rande.html#as_region).

### Set up AWS ECR repositories

These steps assume you intend to host the server and web client on aws. 
For this tutorial, only the virtual browser is required to be hosted on AWS.

Use [`aws ecr create-repository`](https://docs.aws.amazon.com/cli/latest/reference/ecr/create-repository.html) to create a private [docker repository](https://nickjanetakis.com/blog/docker-tip-53-difference-between-a-registry-repository-and-image) for the server, client, and virtual browser.

```bash
aws ecr create-repository --repository-name turtus/server
aws ecr create-repository --repository-name turtus/web
aws ecr create-repository --repository-name tutus/vb
```

For each command take note of the `repositoryUri` field in the output.
Each repository will be located at `[account-id].dkr.ecr.[region].amazonaws.com/[repo-name]`

Next log in to your registry using [`aws get-login`](https://docs.aws.amazon.com/cli/latest/reference/ecr/get-login.html) like so:

```
aws get-login
```

### Run

### Create the .env

Please read the `example.env` located at the root of the project.

Make sure to pay attention to these variables in particular.

`TURTUS_VB_DEFAULT_SIGNAL_SERVER`
The 

`TURTUS_WEB_DEFAULT_SIGNAL_SERVER`

... TO BE CONTINUED

## Development / How Does It All Work

First I would reccomend following the instructions for getting the project to
run locally. It essentially boils down to setting up the dotenv file then building the virtual-browser docker image.

Once that's done start the development servers for both the server and web client. 
You can do that by opening two separate terminal windows.

First, inside `services/server`:
```bash
yarn dev
```

Then, inside `services/web`:
```bash
yarn dev
```

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