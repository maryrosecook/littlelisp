;(function(exports) {
  var Ctx = function() {
    this.first = function(x) {
      return x[0];
    };

    this.rest = function(x) {
      return x.slice(1);
    };

    this.print = function(x) {
      console.log(x);
      return x;

  var Ctx = function(scope, parent) {
    this.scope = scope;
    this.parent = parent;
    this.get = function(name) {
      var item = this.scope[name];
      if (item !== undefined) {
        return item;
      } else if (this.parent !== undefined) {
        return this.parent.get(name);
      }
    };
  };
    };
  };

  var interpret = function(input, ctx) {
    if (ctx === undefined) {
      return interpret(input, new Ctx());
    } else if (input.value !== undefined) {
      return input.value;
    } else {
      if (input[0].type === "identifier") {
        return ctx[input[0].value].apply(this, interpret(input.slice(1), ctx));
      } else {
        return input.slice(0).map(function(x) {
          return interpret(x, ctx);
        });
      }
    }
  };

  var atDepth = function(output, depth) {
    if (depth === 0) {
      return output;
    } else {
      return atDepth(output[output.length - 1], depth - 1);
    }
  };

  var type = function(input) {
    if (!isNaN(parseFloat(input))) {
      return { type:'number', value: parseFloat(input) };
    } else if (input[0] === '"' && input.slice(-1) === '"') {
      return { type:'string', value: input.slice(1, -1) };
    } else {
      return { type:'identifier', value: input };
    }
  };

  var parenthesize = function(input) {
    var output = [];
    var depth = 0;
    while (input.length > 0) {
      var token = input.shift();
      if (token === "(") {
        atDepth(output, depth++).push([]);
      } else if (token === ")") {
        depth--;
      } else {
        atDepth(output, depth).push(type(token));
      }
    }

    return output.pop();
  };

  var tokenize = function(input) {
    return input.split('"').map(function(x, i) {
                   return i % 2 === 0 ? x : x.replace(/ /g, "spaceholder");
                 }).join('"')
                .replace(/\(/g, ' ( ')
                .replace(/\)/g, ' ) ')
                .trim()
                .split(/ +/)
                .map(function(x) {
                  return x.replace(/spaceholder/g, " ");
                });
  };

  var parse = function(input) {
    return parenthesize(tokenize(input));
  };

  exports.tinyLisp = {};
  exports.tinyLisp.parse = parse;
  exports.tinyLisp.interpret = interpret;
})(typeof exports === 'undefined' ? this : exports);
