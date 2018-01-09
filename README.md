# Little Lisp

A mini Lisp interpreter in JavaScript.  Supports lists (obvs), function invocation, lambdas, lets, if statements, numbers, strings and the library functions `first`, `rest` and `print`.

* By Mary Rose Cook
* http://maryrosecook.com
* maryrosecook@maryrosecook.com

Thank you to Martin Tornwall for the implementations of let and if.

## Repl

```
$ node repl.js
```

## Some runnable programs

```lisp
1
```

```lisp
(first (1 2 3))
```

```lisp
((lambda (x) (rest x)) ("a" "b" "c"))
```
