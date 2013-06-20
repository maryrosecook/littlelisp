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
    } else if (input instanceof Array) {
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
      if (ctx.get(input.value) instanceof Function) { // prepare fn
        return fn(input, ctx);
      } else { // var lookup
        return ctx.get(input.value);
      }
    } else { // literal
      return input.value;
    }
  };

  var categorize = function(input) {
    if (input instanceof Array) {
      return input.map(categorize);
    } else if (!isNaN(parseFloat(input))) {
      return { type:'literal', value: parseFloat(input) };
    } else if (input[0] === '"' && input.slice(-1) === '"') {
      return { type:'literal', value: input.slice(1, -1) };
    } else {
      return { type:'identifier', value: input };
    }
  };

  var atDepth = function(output, depth) {
    if (depth === 0) {
      return output;
    } else {
      return atDepth(output[output.length - 1], depth - 1);
    }
  };

  var parenthesize = function(input) {
    var output = [];
    var depth = 0;
    input.forEach (function(token) {
      if (token === "(") {
        atDepth(output, depth++).push([]);
      } else if (token === ")") {
        depth--;
      } else {
        atDepth(output, depth).push(token);
      }
    });

    return output.pop();
  };

  var tokenize = function(input) {
    return input.split('"').map(function(x, i) {
                   return i % 2 === 0 ? x : x.replace(/ /g, "!!!!!!!!!!!!");
                 }).join('"')
                .replace(/\(/g, ' ( ')
                .replace(/\)/g, ' ) ')
                .trim()
                .split(/\s+/)
                .map(function(x) {
                  return x.replace(/!!!!!!!!!!!!/g, " ");
                });
  };

  var parse = function(input) {
    return categorize(parenthesize(tokenize(input)));
  };

  exports.tinyLisp = {};
  exports.tinyLisp.parse = parse;
  exports.tinyLisp.interpret = interpret;
})(typeof exports === 'undefined' ? this : exports);
