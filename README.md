# node-red-contrib-ngrok

This is a client ([ngrok-javascript](https://github.com/ngrok/ngrok-javascript)) to expose and manage the popular tunnelling service [ngrok](https://ngrok.com) from Node-RED.

You can start and stop a tunnel using the button on the node or by injecting values, the node will then output the ngrok host address as the `msg.payload`

The tunnel will expose the port that your Node-RED GUI is running on (eg 1880), you can override this port by setting the Port value in the node.

The 3.0.0 release uses the new ngrok javascript client, as such region support has been removed an it now uses ngrok's new global load balancing service.
The new client no longer offers the local debug console on port 4040, however ngrok have a new console as part of the dashboard in beta as of Feb 2024.

Account registration is now required but all users get one free reserved tunnel address even on the free plan.

Other optional fields around the host and port that the connection is forwarded to along with adding auth or setting up a TCP tunnel are configurable within the node, consult the built in help or the ngrok documentation for an explanation.

For dynamic control, there is a demo flow included. Use <kbd>CTRL+I</kbd> then choose **examples** → **node-red-contrib-ngrok** → **dynamic-control-demo**

### !!!DANGER!!!

By running this node you will be exposing your Node-RED install to the public internet, therefore you are *strongly* advised to set an admin password on the editor.
read (https://nodered.org/docs/security)

Feedback, Issues and PRs welcome on github.

### Platform Support

Pre-built binaries are provided on NPM for the following platforms:

| OS         | i686 | x64 | aarch64 | arm |
| ---------- | -----|-----|---------|-----|
| Windows    |   ✓  |  ✓  |    *    |     |
| MacOS      |      |  ✓  |    ✓    |     |
| Linux      |      |  ✓  |    ✓    |  ✓  |
| Linux musl |      |  ✓  |    ✓    |     |
| FreeBSD    |      |  ✓  |         |     |
| Android    |      |     |    ✓    |  ✓  |

> **Note**
> `ngrok-javascript`, and [ngrok-rust](https://github.com/ngrok/ngrok-rust/) which it depends on, are open source, so it may be possible to build them for other platforms.
> * `Windows-aarch64` will be supported after the next release of [Ring](https://github.com/briansmith/ring/issues/1167).