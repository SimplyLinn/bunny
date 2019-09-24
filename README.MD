# Turt.us

A self-hosted rabb.it clone using docker based on [bunny]()

Features
- Control a virtual stateless browser
- Voice, video, and text chat

## Running

For now the application is run in three separate steps. In the future, the app will 
be deployable using only one command and new virtual browser docker containers will 
be controllable creatable from the backend.

First start the signaling server. This will expose a port on the local machine.
The signal server requires certificates in order for the virtual-browser to connect to it.
Probably will use certbot to generate on the fly in the future.

Next start the client application.

Finally, start the docker container.

The docker container requires the url to a webrtc signaling server. 
Locally this will be: `wss://local-ip-address:PORT`

### Development

Ensure port 43 is open
The tech stack consists of three key elements:

## VirtualBrowser (VB)

A virtual browser endpoint.

## Server

A back-end for controlling specific 

## Client

The front-facing web interface that allows users to interact with the server and VB.

Built using React.