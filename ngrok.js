const ng = require('ngrok');

module.exports = function (RED) {
  function ngrok(config) {
    const region_types = ["us", "eu", "ap", "au", "sa", "jp", "in"];
    const proto_types = ["http", "tcp"];
    const bind_tls_types = ["https", "true", "http", "false", "both"];

    RED.nodes.createNode(this, config);
    var node = this;
    node.creds = RED.nodes.getNode(config.creds);
    node.port = config.port || "";
    node.portType = config.portType || "num";
    node.region = config.region;
    node.regionType = config.regionType || "us";
    node.proto = config.proto;
    node.protoType = config.protoType || "http";
    node.bind_tls = config.bind_tls;
    node.bind_tlsType = config.bind_tlsType || "https";
    node.subdomain = config.subdomain;
    node.subdomainType = config.subdomainType || "none";
    node.auth = config.auth;
    node.authType = config.authType || "str";
    node.hostHeader = config.hostHeader || "";
    node.hostHeaderType = config.hostHeaderType || "none";
    if (RED.nodes.getNode(config.creds) == null) {
      node.authtoken = "";
    } else {
      node.authtoken = RED.nodes.getNode(config.creds).credentials.authtoken;
    }
    node.status({ fill: "grey", shape: "ring", text: "idle" });

    node.on('input', function (msg) {

      if (msg.payload == 'off' || msg.payload === false) {
        (async function () {
          await ng.kill();
          msg.payload = null;
          node.send(msg);
          node.status({ fill: "red", shape: "ring", text: "disconnected" });
        })();

      } else if (msg.payload == 'on' || msg.payload == true) {
        let _proto;
        if (proto_types.indexOf(node.protoType) >= 0) {
          _proto = node.protoType;
        } else {
          _proto = RED.util.evaluateNodeProperty(node.proto, node.protoType, node, msg);
        }

        let _region;
        if (region_types.indexOf(node.regionType) >= 0) {
          _region = node.regionType;
        } else {
          _region = RED.util.evaluateNodeProperty(node.region, node.regionType, node, msg);
        }

        let _bind_tls;
        if (bind_tls_types.indexOf(node.bind_tlsType) >= 0) {
          _bind_tls = node.bind_tlsType;
        } else {
          _bind_tls = RED.util.evaluateNodeProperty(node.bind_tls, node.bind_tlsType, node, msg);
        }

        let _host_header;
        if (node.hostHeaderType == "none") {
          _host_header = null;
        } else {
          _host_header = RED.util.evaluateNodeProperty(node.hostHeader, node.hostHeaderType, node, msg);
        }

        let _auth;
        if (node.authType == "none") {
          _auth = null;
        } else {
          _auth = RED.util.evaluateNodeProperty(node.auth, node.authType, node, msg);
        }

        let _port = RED.util.evaluateNodeProperty(node.port, node.portType, node, msg);
        let _subdomain = RED.util.evaluateNodeProperty(node.subdomain, node.subdomainType, node, msg);

        //ensure _bind_tls is valid
        switch (_bind_tls) {
          case "false":
          case false:
          case "http":
            _bind_tls = "false"
            break
          case "both":
            _bind_tls = "both"
            break
          default:
            _bind_tls = "true"//default to secure
        }

        //ensure port is something
        if (!_port) {
          _port = RED.settings.uiPort;
        }

        var options = {
          authtoken: node.authtoken,
          proto: _proto,
          addr: _port + "",
          subdomain: _subdomain,
          region: _region,
          bind_tls: _bind_tls,
          host_header: _host_header,
        }

        if (_auth) {
          const auth = _auth.split(':');
          if (!auth || auth.length !== 2) {
            node.error("ngrok auth should be formatted as user:password", msg);
            return;
          }
          options.auth = _auth;
        }

        clean(options);

        (async function () {
          try {
            //Disconnect once before reconnecting
            await ng.kill();
            const url = await ng.connect(options);
            msg.payload = url;
            node.send(msg);
            node.status({ fill: "green", shape: "dot", text: url });
          } catch ({ message }) {
            console.log(`Connect error: ${message}`);
          }
        })();
      }
    });
  }

  function ngrokauth(n) {
    RED.nodes.createNode(this, n);
    this.authtoken = n.authtoken;
    this.name = n.name;
  }

  RED.nodes.registerType("ngrok", ngrok);
  RED.nodes.registerType("ngrokauth", ngrokauth, {
    credentials: {
      authtoken: { type: "text" }
    }
  });

  RED.httpAdmin.post("/ngrokInject/:id", RED.auth.needsPermission("inject.write"), function (req, res) {
    var node = RED.nodes.getNode(req.params.id);
    if (node != null) {
      try {
        var state = (req.body.on == 'true');
        node.receive({ payload: state });
        res.sendStatus(200);
      } catch (err) {
        res.sendStatus(500);
        node.error(RED._("inject.failed", { error: err.toString() }));
      }
    } else {
      res.sendStatus(404);
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
