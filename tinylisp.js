;(function(exports) {
  var library = {
    first: function(x) {
      return x[0];
    },
    rest: function(x) {
      return x.slice(1);
    },
    print: function(x) {
      console.log(x);
      return x;
    }
  };

  var Ctx = function(scope, parent) {
    this.scope = scope;
    this.parent = parent;
    this.get = function(identifier) {
      var item = this.scope[identifier];
      if (item !== undefined) {
        return item;
      } else if (this.parent !== undefined) {
        return this.parent.get(identifier);
      }
    };
  };

  var lambda = function(input, ctx) {
    return {
      type: "function",
      value: function(args) {
        var lambdaScope = input[1].reduce(function(acc, x, i) {
          acc[x.value] = args[i];
          return acc;
        }, {});
        return interpret(input[2], new Ctx(lambdaScope, ctx));
      }
    };
  };

  var fn = function(input, ctx) {
    return {
      type: "function",
      value: function(args) {
        return ctx.get(input.value).apply(undefined, args);
      }
    };
  };

  var interpret = function(input, ctx) {
    if (ctx === undefined) {
      return interpret(input, new Ctx(library));
    } else if (Object.prototype.toString.call(input) === '[object Array]') {
      if (input[0].value === "lambda") {
        return lambda(input, ctx);
      } else {
        var list = input.map(function(x) { return interpret(x, ctx); });
        if (list[0].type === "function") {
          return list[0].value(list.slice(1));
        } else {
          return list;
        }
      }
    } else if (input.type === "identifier") {
      if (typeof ctx.get(input.value) === "function") { // fn
        return fn(input, ctx);
      } else { // var lookup
        return ctx.get(input.value);
      }
    } else { // literal
      return input.value;
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
      return { type:'literal', value: parseFloat(input) };
    } else if (input[0] === '"' && input.slice(-1) === '"') {
      return { type:'literal', value: input.slice(1, -1) };
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
