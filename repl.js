var repl = require("repl");
var tinyLisp = require("./tinylisp").tinyLisp;

repl.start({
  prompt: "> ",
  eval: function(cmd, context, filename, callback) {
    if (cmd !== "(\n)") {
      cmd = cmd.slice(1, -2); // rm parens and newline added by repl
      var ret = tinyLisp.interpret(tinyLisp.parse(cmd));
      callback(null, ret);
    } else {
      callback(null);
    }
  }
});
