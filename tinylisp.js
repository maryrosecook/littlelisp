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

  var Context = function(scope, parent) {
    this.scope = scope;
    this.parent = parent;
    this.get = function(identifier) {
      if (identifier in this.scope) {
        return this.scope[identifier];
      } else if (this.parent !== undefined) {
        return this.parent.get(identifier);
      }
    };
  };

  var special = {
    let: function(input, context) {
      var letContext = input[1].reduce(function(acc, x) {
        acc.scope[x[0].value] = interpret(x[1], context);
        return acc;
      }, new Context({}, context));
      return interpret(input[2], letContext);
    },

    lambda: function(input, context) {
      return function() {
        var lambdaArguments = arguments;
        var lambdaScope = input[1].reduce(function(acc, x, i) {
          acc[x.value] = lambdaArguments[i];
          return acc;
        }, {});
        return interpret(input[2], new Context(lambdaScope, context));
      };
    },

    if: function(input, context) {
      return interpret(input[1], context) ?
        interpret(input[2], context) :
        interpret(input[3], context);
    }
  };

  var interpretList = function(input, context) {
    if (input[0].value in special) {
      return special[input[0].value](input, context);
    } else {
      var list = input.map(function(x) { return interpret(x, context); });
      if (list[0] instanceof Function) { // check here for js fn (lambda or built-in)
        return list[0].apply(undefined, list.slice(1));
      } else {
        return list;
      }
    }
  };

  var interpret = function(input, context) {
    if (context === undefined) {
      return interpret(input, new Context(library));
    } else if (input instanceof Array) {
      return interpretList(input, context);
    } else if (input.type === "identifier") {
      return context.get(input.value);
    } else { // literal
      return input.value;
    }
  };

  var categorize = function(input) {
    if (!isNaN(parseFloat(input))) {
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

  // do this without depth
  var parenthesize = function(input) {
    var output = [];
    var depth = 0;
    input.forEach (function(token) {
      if (token === "(") {
        atDepth(output, depth++).push([]);
      } else if (token === ")") {
        depth--;
      } else {
        atDepth(output, depth).push(categorize(token));
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
    return parenthesize(tokenize(input));
  };

  exports.tinyLisp = {};
  exports.tinyLisp.parse = parse;
  exports.tinyLisp.interpret = interpret;
})(typeof exports === 'undefined' ? this : exports);
