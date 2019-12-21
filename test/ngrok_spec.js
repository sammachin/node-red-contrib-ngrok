require('dotenv').config();
const isUrl = require("is-url");
const should = require("should");
const helper = require("node-red-node-test-helper");
helper.init(require.resolve("node-red"));

const node = require("../ngrok");
let ngrok_authtoken;

describe("Ngrok Node", () => {

  before(function(done) {
    ngrok_authtoken = process.env.NGROK_AUTH_TOKEN;
    helper.startServer(done);
  });

  after((done) => {
    helper.stopServer(done);
  });

  afterEach(() => {
    helper.unload();
  });

  it("should be loaded", (done) => {
    const flow = [{ id: "n1", type: "ngrok", name: "test" }];
    helper.load(node, flow, () => {
      const n1 = helper.getNode("n1");
      n1.should.have.property("name", "test");
      done();
    });
  });

  describe("should make payload", () => {
    it("send on with authtoken", (done) => {
        const flow = [
          { id: "n1", type: "ngrok", port: "1880", region:"us", creds: "creds", subdomain: "", name: "test", wires:[["n2"]] },
          { id: "creds", type: "ngrokauth"},
          { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, {n1:{auth:"test:test", }, creds:{authtoken:ngrok_authtoken}},() => {
          const n2 = helper.getNode("n2");
          const n1 = helper.getNode("n1");
          n2.on("input", (msg) => {
            should.exist(msg.payload);
            isUrl(msg.payload).should.be.true();
            done();
          });
          n1.receive({ payload: "on" });
        });
      });

      it("send off", (done) => {
        const flow = [
            { id: "n1", type: "ngrok", port: "1880", region:"us", creds: "creds", subdomain: "", name: "test", wires:[["n2"]] },
            { id: "creds", type: "ngrokauth"},
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, {n1:{auth:"test:test", }, creds:{authtoken:ngrok_authtoken}}, () => {
          const n2 = helper.getNode("n2");
          const n1 = helper.getNode("n1");
          n2.on("input", (msg) => {
            should.not.exist(msg.payload);
            done();
          });
          n1.receive({ payload: "off" });
        });
      });

      it("send on with dummy authtoken", (done) => {
        const flow = [
          { id: "n1", type: "ngrok", port: "1880", region:"us", creds: "creds", subdomain: "", name: "test", wires:[["n2"]] },
          { id: "creds", type: "ngrokauth"},
          { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, {n1:{auth:"test:test", }, creds:{authtoken:"dummy"}},() => {
            const n1 = helper.getNode("n1");
            n1.on("call:error", (e) => {
              console.log(e);
                // e.args[0].error_code.should.be.equal(103);
                done();
            });
            n1.receive({ payload: "on" });
        });
      });

      it("send on without authtoken", (done) => {
        const flow = [
          { id: "n1", type: "ngrok", port: "1880", region:"us", creds: "creds", subdomain: "", name: "test", wires:[["n2"]] },
          { id: "creds", type: "ngrokauth"},
          { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, {n1:{auth:"test:test", }, creds:{authtoken:""}},() => {
            const n1 = helper.getNode("n1");
            n1.on("call:error", (e) => {
              console.log(e);
                // e.args[0].message.should.be.equal("authtoken is empty");
                done();
            });
            n1.receive({ payload: "on" });
        });
      });
  });
});