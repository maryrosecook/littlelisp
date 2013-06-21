var t = require('./tinylisp').tinyLisp;

var is = function(input, type) {
  return Object.prototype.toString.call(input) === '[object ' + type + ']';
};

// takes an AST and replaces type annotated nodes with raw values
var unannotate = function(input) {
  if (is(input, 'Array')) {
    if (input[0] === undefined) {
      return [];
    } else if (is(input[0], 'Array')) {
      return [unannotate(input[0])].concat(unannotate(input.slice(1)));
    } else {
      return unannotate(input[0]).concat(unannotate(input.slice(1)));
    }
  } else {
    return [input.value];
  }
};

describe('tinyLisp', function() {
  describe('parse', function() {
    it('should lex an atom in a list', function() {
      expect(unannotate(t.parse("()"))).toEqual([]);
    });

    it('should lex multi atom list', function() {
      expect(unannotate(t.parse("(hi you)"))).toEqual(["hi", "you"]);
    });

    it('should lex list containing list', function() {
      expect(unannotate(t.parse("((x))"))).toEqual([["x"]]);
    });

    it('should lex list containing list', function() {
      expect(unannotate(t.parse("(x (x))"))).toEqual(["x", ["x"]]);
    });

    it('should lex list containing list', function() {
      expect(unannotate(t.parse("(x y)"))).toEqual(["x", "y"]);
    });

    it('should lex list containing list', function() {
      expect(unannotate(t.parse("(x (y) z)"))).toEqual(["x", ["y"], "z"]);
    });

    it('should lex list containing list', function() {
      expect(unannotate(t.parse("(x (y) (a b c))"))).toEqual(["x", ["y"], ["a", "b", "c"]]);
    });

    describe('atoms', function() {
      it('should parse out numbers', function() {
        expect(unannotate(t.parse("(1 (a 2))"))).toEqual([1, ["a", 2]]);
      });
    });
  });

  describe('interpret', function() {
    describe('lists', function() {
      it('should return list of strings', function() {
        expect(t.interpret(t.parse('("hi" "mary" "rose")'))).toEqual(['hi', "mary", "rose"]);
      });

      it('should return list of numbers', function() {
        expect(t.interpret(t.parse('(1 2 3)'))).toEqual([1, 2, 3]);
      });

      it('should return list of numbers in strings as strings', function() {
        expect(t.interpret(t.parse('("1" "2" "3")'))).toEqual(["1", "2", "3"]);
      });
    });

    describe('atoms', function() {
      it('should return string atom', function() {
        expect(t.interpret(t.parse('"a"'))).toEqual("a");
      });

      it('should return string with space atom', function() {
        expect(t.interpret(t.parse('"a b"'))).toEqual("a b");
      });

      it('should return number atom', function() {
        expect(t.interpret(t.parse('123'))).toEqual(123);
      });
    });

    describe('invocation', function() {
      it('should run print on an int', function() {
        expect(t.interpret(t.parse("(print 1)"))).toEqual(1);
      });

      it('should return first element of list', function() {
        expect(t.interpret(t.parse("(first (1 2 3))"))).toEqual(1);
      });

      it('should return rest of list', function() {
        expect(t.interpret(t.parse("(rest (1 2 3))"))).toEqual([2, 3]);
      });
    });

    describe('lambdas', function() {
      it('should take lambda and return lambda node', function() {
        var l = t.interpret(t.parse("(lambda () (rest (1 2)))"));
        expect(l.type).toEqual("function");
        expect(typeof l.value).toEqual("function");
      });

      it('should return correct result when invoke lambda w no params', function() {
        expect(t.interpret(t.parse("((lambda () (rest (1 2))))"))).toEqual([2]);
      });

      it('should return correct result for lambda that takes and returns arg', function() {
        expect(t.interpret(t.parse("((lambda (x) x)) 1)"))).toEqual(1);
      });

      it('should return correct result for lambda that returns list of vars', function() {
        expect(t.interpret(t.parse("((lambda (x y) (x y)) 1 2)"))).toEqual([1, 2]);
      });

      it('should get correct result for lambda that returns list of lits + vars', function() {
        expect(t.interpret(t.parse("((lambda (x y) (0 x y)) 1 2)"))).toEqual([0, 1, 2]);
      });

      it('should return correct result when invoke lambda w params', function() {
        expect(t.interpret(t.parse("((lambda (x) (first (x))) 1)")))
          .toEqual(1);
      });
    });

    describe('let', function() {
      it('should eval inner expression w names bound', function() {
        expect(t.interpret(t.parse("(let ((x 1) (y 2)) (x y))"))).toEqual([1, 2]);
      });

      it('should not expose parallel bindings to each other', function() {
        // Expecting undefined for y to be consistent with normal
        // identifier resolution in tinyLisp.
        expect(t.interpret(t.parse("(let ((x 1) (y x)) (x y))"))).toEqual([1, undefined]);
      });

      it('should accept empty binding list', function() {
        expect(t.interpret(t.parse("(let () 42)"))).toEqual(42);
      });
    });

    describe('letrec', function() {
      it('should expose previous bindings to later ones', function() {
        expect(t.interpret(t.parse("(letrec ((x 42) (y x)) y)"))).toEqual(42);
      });

      it('should not expose later bindings to previous ones', function() {
        expect(t.interpret(t.parse("(letrec ((x y) (y 42)) x)"))).toEqual(undefined);
      });

      it('should accept empty binding list', function() {
        expect(t.interpret(t.parse("(letrec () 42)"))).toEqual(42);
      });
    });

    describe('if', function() {
      it('should choose the right branch', function() {
        expect(t.interpret(t.parse("(if 1 42 4711)"))).toEqual(42);
        expect(t.interpret(t.parse("(if 0 42 4711)"))).toEqual(4711);
      });
    });

    describe('and', function() {
      it('should be true when empty', function() {
        expect(t.interpret(t.parse("(and)"))).toEqual(true);
      });

      it('should be false if any operand is false', function() {
        expect(t.interpret(t.parse("(and 1 1 0 1)"))).toEqual(false);
        expect(t.interpret(t.parse("(and 0 1"))).toEqual(false);
        expect(t.interpret(t.parse("(and 1 0"))).toEqual(false);
      });

      it('should be true if all operands are true', function() {
        expect(t.interpret(t.parse("(and 1 1"))).toEqual(true);
        expect(t.interpret(t.parse("(and 1"))).toEqual(true);
      });
    });

    describe('or', function() {
      it('should be false when empty', function() {
        expect(t.interpret(t.parse("(or)"))).toEqual(false);
      });

      it('should be true if any operand is true', function() {
        expect(t.interpret(t.parse("(or 1 1 0 1)"))).toEqual(true);
        expect(t.interpret(t.parse("(or 0 1"))).toEqual(true);
        expect(t.interpret(t.parse("(or 1 0"))).toEqual(true);
      });

      it('should be false if all operands are false', function() {
        expect(t.interpret(t.parse("(or 0 0"))).toEqual(false);
        expect(t.interpret(t.parse("(or 0"))).toEqual(false);
      });
    });
  });
});
