import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

test("the classic bootstrap keeps strict native-call receivers", () => {
  let scope;
  vm.runInNewContext(readFileSync(new URL("./bootstrap.classic.js", import.meta.url), "utf8"), {
    __nsh_browser_bootstrap: value => { scope = value; },
  });
  const metadata = [{ specifier: "custom", classes: [], modules: [{ flat: true,
    functions: [{ id: 1, name: "receiver" }], constants: {},
  }] }];
  const modules = scope.createModules((op, args) => {
    if (op === 200) return metadata;
    assert.equal(op, 201);
    return args[1];
  }, {}, () => true, () => {}, () => {});
  const receiver = modules.exports.get("custom").receiver;
  assert.equal(receiver.call(null), null);
  assert.equal(receiver(), undefined);
});
