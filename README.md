# node-red-contrib-ngrok

This is a wrapper to expose and manage the popular tunnelling service [ngrok](https://ngrok.com) from Node-RED.

You can start and stop a tunnel using the button on the node or by injecting values,  the node will then output the ngrok host address as the `msg.payload`

The tunnel will expose the port that your node-red GUI is running on (eg 1880), you can override this port by setting the Port value in the node.

The default ngrok region is US but you can also set Europe, Asia, Australia, South America, Japan or India.

While ngrok doesn't require account registration if you register then you can have tunnels that live for more than 8 hour even on the free package, to get additional features such as reserved hostnames and multiple tunnels require a paid account.
You can set your authtoken for your ngrok account as a config param, if you don't have an authtoken, you dont need to enter one (leave set to "Add new ...")

Other optional fields around the host and port that the connection is forwarded to along with adding auth or setting up a TCP tunnel are configurable within the node, consult the build in help or the ngrok documentation for an explanation.

For dynamic control, there is a demo flow included. Use <kbd>CTRL+I</kbd> then choose **examples** → **node-red-contrib-ngrok** → **dynamic-control-demo**

### !!!DANGER!!!

By running this node you will be exposing your node-red install to the public internet, therefore you are *strongly* advised to set an admin password on the editor.
read (https://nodered.org/docs/security)

Feedback, Issues and PRs welcome on github.
