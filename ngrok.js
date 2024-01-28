const ng = require('@ngrok/ngrok');
const Package = require('./package.json');

module.exports = function (RED) {
  function ngrok(config) {
    const proto_types = ['http', 'tcp'];
    const bind_tls_types = ['https', 'true', 'http', 'false'];

    RED.nodes.createNode(this, config);
    var node = this;
    node.creds = RED.nodes.getNode(config.creds);
    node.port = config.port || '';
    node.portType = config.portType || 'num';
    node.host = config.host || '';
    node.hostType = config.hostType || 'localhost';
    node.proto = config.proto || 'http';
    node.bind_tls = config.bind_tls;
    node.bind_tlsType = config.bind_tlsType || 'https';
    node.subdomain = config.subdomain;
    node.subdomainType = config.subdomainType || 'none';
    node.auth = config.auth;
    node.authType = config.authType || 'str';
    node.hostHeader = config.hostHeader || '';
    node.hostHeaderType = config.hostHeaderType || 'none';
    if (RED.nodes.getNode(config.creds) == null) {
      node.authtoken = '';
    } else {
      node.authtoken = RED.nodes.getNode(config.creds).credentials.authtoken;
    }
    node.listener = null;

    node.status({fill: 'grey', shape: 'ring', text: 'idle'});

    node.on('input', function (msg) {
      if (!node.authtoken || node.authtoken == '') {
        node.error('Usage of ngrok requires a verified account and authtoken');
        node.status({fill: 'red', shape: 'dot', text: 'error'});
        return;
      }

      if (['false', 'off', '0'].indexOf(String(msg.payload).toLowerCase()) != -1) {
        (async function () {
          try {
            if (node.listener) {
              await node.listener.close();
              node.listener = null;
            } else {
              // _domain
              let _domain = RED.util.evaluateNodeProperty(node.subdomain, node.subdomainType, node, msg);
              if (_domain.indexOf('.') > -1) {
                await ng.disconnect(_domain);
              }
            }
          } catch (_) {}
          msg.payload = null;
          node.send(msg);
          node.status({fill: 'red', shape: 'ring', text: 'disconnected'});
        })();
      } else if (['true', 'on', '1'].indexOf(String(msg.payload).toLowerCase()) != -1) {
        let _port, _host, _proto, _bind_tls, _auth, _host_header;

        if (node.portType == 'node-red' || node.portType == '') {
          _port = null;
        } else {
          _port = RED.util.evaluateNodeProperty(node.port, node.portType, node, msg);
        }

        if (!_port) {
          _port = RED.settings.uiPort;
        } //ensure port is something

        if (node.hostType == 'localhost' || node.hostType == '') {
          _host = '127.0.0.1';
        } else {
          _host = RED.util.evaluateNodeProperty(node.host, node.hostType, node, msg);
        }

        if (proto_types.indexOf(node.proto) >= 0) {
          _proto = node.proto;
        } else {
          node.error('Invalid protocol type', msg);
          node.status({fill: 'red', shape: 'dot', text: 'error'});
          return;
        }

        if (String(_proto) === 'http') {
          //binding
          if (bind_tls_types.indexOf(node.bind_tlsType) >= 0) {
            _bind_tls = node.bind_tlsType;
          } else {
            _bind_tls = RED.util.evaluateNodeProperty(node.bind_tls, node.bind_tlsType, node, msg);
          }
          //subdomain
          _domain = RED.util.evaluateNodeProperty(node.subdomain, node.subdomainType, node, msg);
          //auth
          if (node.authType == 'none') {
            _auth = null;
          } else {
            _auth = RED.util.evaluateNodeProperty(node.auth, node.authType, node, msg);
          }
          //host-header
          if (node.hostHeaderType == 'none') {
            _host_header = null;
          } else {
            _host_header = RED.util.evaluateNodeProperty(node.hostHeader, node.hostHeaderType, node, msg);
          }
          //ensure binding is valid
          switch (_bind_tls) {
            case 'false':
            case false:
            case 'https':
              _bind_tls = ['https'];
              break;
            case 'http':
              _bind_tls = ['http'];
              break;
            default:
              _bind_tls = ['https']; //default to secure
          }
        }

        // metadata
        const _red = RED.version();
        const _pname = Package.name.trim();
        const _pversion = Package.version.trim();
        const _nname = node.name;
        const _nid = node.id;

        var options = {
          authtoken: node.authtoken,
          proto: _proto,
          addr: _host + ':' + _port,
          schemes: _bind_tls,
          host_header: _host_header,
          session_metadata: `{"Node-RED":"${_red}","${_pname}":"${_pversion}","name":"${_nname},"id":"${_nid}"}`
        };
        if (_domain.indexOf('.') > -1) {
          options.domain = _domain;
        } else {
          options.domain = _domain+".ngrok.io"; // Added for backwards compatibilty
        }
        if (_auth) {
          const auth = _auth.split(':');
          if (!auth || auth.length !== 2) {
            node.error('ngrok auth should be formatted as username:password', msg);
            node.status({fill: 'red', shape: 'dot', text: 'error'});
            return;
          }
          if (auth[1].length < 8) {
            node.error('Password must be at least 8 characters');
            node.status({fill: 'red', shape: 'dot', text: 'error'});
            return;
          }
          options.basic_auth = _auth;
        }

        clean(options);
        (async function () {
          try {
            //Disconnect once before reconnecting
            if (node.listener) {
              await node.listener.close();
              node.listener = null;
            } else {
              if (options.hostname) {
                await ng.disconnect(options.hostname);
              }
            }
            console.log(options)
            node.listener = await ng.forward(options);
            msg.payload = node.listener.url();
            node.send(msg);
            node.status({fill: 'green', shape: 'dot', text: msg.payload});
          } catch ({message}) {
            node.error(`Connect error: ${message}`);
            node.status({fill: 'red', shape: 'dot', text: 'error'});
            return;
          }
        })();
      }
    });

    node.on('close', function (removed, done) {
      (async function () {
        try {
          if (node.listener) {
            await node.listener.close();
            node.listener = null;
          } else {
            // _domain
            let _domain = RED.util.evaluateNodeProperty(node.subdomain, node.subdomainType, node);
            if (_domain.indexOf('.') > -1) {
              await ng.disconnect(_domain);
            }
          }
        } catch (_) {}
      })();
      done();
    });
  }

  function ngrokauth(n) {
    RED.nodes.createNode(this, n);
    this.authtoken = n.authtoken;
    this.name = n.name;
  }

  RED.nodes.registerType('ngrok', ngrok);
  RED.nodes.registerType('ngrokauth', ngrokauth, {
    credentials: {
      authtoken: {type: 'text'}
    }
  });

  RED.httpAdmin.post('/ngrokInject/:id', RED.auth.needsPermission('inject.write'), function (req, res) {
    var node = RED.nodes.getNode(req.params.id);
    if (node != null) {
      try {
        var state = req.body.on == 'true';
        node.receive({payload: state});
        res.sendStatus(200);
      } catch (err) {
        res.sendStatus(500);
        node.error(RED._('inject.failed', {error: err.toString()}));
      }
    } else {
      res.sendStatus(404);
    }
  });
};

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
      delete obj[propName];
    }
  }
}
