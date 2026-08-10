import { isFlexibleCodeFillCorrect } from "../app/js/format.js";

console.assert(isFlexibleCodeFillCorrect("set", "set()"), "Test 1 failed: set vs set()");
console.assert(isFlexibleCodeFillCorrect("set()", "set"), "Test 2 failed: set() vs set");
console.assert(isFlexibleCodeFillCorrect("`set`", "set()"), "Test 3 failed: `set` vs set()");
console.assert(isFlexibleCodeFillCorrect("discard", "s.discard(element)", ["s.discard(element)", "s.remove(element)"], 0), "Test 4 failed: discard vs s.discard(element)");
console.assert(isFlexibleCodeFillCorrect("discard()", "s.discard(element)", ["s.discard(element)", "s.remove(element)"], 0), "Test 5 failed: discard() vs s.discard(element)");
console.assert(!isFlexibleCodeFillCorrect("frozenset", "set()"), "Test 6 failed: frozenset vs set()");
console.assert(!isFlexibleCodeFillCorrect("dict", "set()"), "Test 7 failed: dict vs set()");

console.log("All flexible code fill unit tests PASSED!");
