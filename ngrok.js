const ng = require('ngrok');

module.exports = function(RED) {
    function ngrok(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.creds = RED.nodes.getNode(config.creds);
        this.subdomain = config.subdomain;
        this.region = config.region;
        if (RED.nodes.getNode(config.creds) == null){
          this.authtoken = "";
        } else {
          this.authtoken = RED.nodes.getNode(config.creds).credentials.authtoken;
        }
        if (config.port == ""){
          this.port = RED.settings.uiPort;
        } else{
          this.port = config.port;
        }
        node.on('input', function(msg) {
          var options = {
                proto: 'http', 
                addr: this.port, 
                subdomain: this.subdomain, 
                authtoken: this.authtoken,
                region: this.region, 
            }
            clean(options);
            if (msg.payload == 'on'){
              (async function(){
                try{
                  const url = await ng.connect(options);
                  msg.payload = url;
                  node.send(msg);
                  node.status({fill:"green",shape:"dot",text:url});
                }catch(e){
                  node.error(e);
                  node.status({fill:"red",shape:"dot",text: "connnect error"});
                }
              })();
          }
          else if (msg.payload == 'off'){
              (async function(){
                  await ng.kill();
                  msg.payload = null;
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
 RED.nodes.registerType("ngrokauth",ngrokauth,{
   credentials: {
     authtoken: {type:"text"}
   }
 });      
}

function clean(obj) {
  for (var propName in obj) { 
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
      delete obj[propName];
    }
  }
}
