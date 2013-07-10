var repl = require("repl");
var littleLisp = require("./littlelisp").littleLisp;

repl.start({
  prompt: "> ",
  eval: function(cmd, context, filename, callback) {
    if (cmd !== "(\n)") {
      cmd = cmd.slice(1, -2); // rm parens and newline added by repl
      var ret = littleLisp.interpret(littleLisp.parse(cmd));
      callback(null, ret);
    } else {
      callback(null);
    }
  }
});
