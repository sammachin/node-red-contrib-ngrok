# node-red-contrib-ngrok

This is a wrapper to expose and manage the popular tunnelling service [ngrok](https://ngrok.com) within node red

You can start and stop a tunnel, currently the easiest way to do this is to create inject nodes that send a payload of `on` or `off` the node will then output the ngrok host address as the `msg.payload`

The tunnel will expose the port the your node-red GUI is running on (eg 1880), you can overide this port by setting the Port value in the node.

The default ngrok region is US but you can also set Europe or Asia.

While ngrok doesn't require account registration if you register then you can have tunnels that live for more than 8 hour even on the free package, to get additional features such as reserved hostnames and multiple tunnles reuire a paid account.
You can set your authtoken for your ngrok account as a config param, if you don't have an authtoken leave this out, the node will warn that it is not full configured but this is not an issue


### !!!DANGER!!!

By running this node you will be exposing your node-red install to the public internet, therefore you are *strongly* advised to set an admin password on the editor.
read (https://nodered.org/docs/security)

Feedback, Issues and PRs welcome on github.
