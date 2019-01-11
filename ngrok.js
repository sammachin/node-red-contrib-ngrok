const ng = require('ngrok');

module.exports = function(RED) {
    function ngrok(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.creds = RED.nodes.getNode(config.creds);
        this.subdomain = config.subdomain;
        this.region = config.region;
        if (RED.nodes.getNode(config.creds) == null){
          this.authtoken = "";
        } else {
          this.authtoken = RED.nodes.getNode(config.creds).authtoken;
        }
        console.log(this.authtoken);
        node.on('input', function(msg) {
          if (this.creds == null)
          var options = {
                proto: 'http', 
                addr: RED.settings.uiPort, 
                subdomain: this.subdomain, 
                authtoken: this.authtoken,
                region: this.region, 
            }
            clean(options);
            if (msg.payload == 'on'){
              (async function(){
                  const url = await ng.connect(options);
                  msg.payload.url = url;
                  node.send(msg);
                  node.status({fill:"green",shape:"dot",text:"connected"});
              })();
          }
          else if (msg.payload == 'off'){
              (async function(){
                  await ng.disconnect();
                  msg.payload.url = null;
                  node.send(msg);
                  node.status({fill:"red",shape:"ring",text:"disconnected"});
              })();
          }

          
        });
  }
  function ngrokauth(n){
     RED.nodes.createNode(this, n);
     this.authtoken = n.authtoken;
  }
 RED.nodes.registerType("ngrok",ngrok);
 RED.nodes.registerType("ngrokauth",ngrokauth);    
}

function clean(obj) {
  for (var propName in obj) { 
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
      delete obj[propName];
    }
  }
}