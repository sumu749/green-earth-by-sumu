# green-earth-by-sumu

---

## 1. Difference between `var`, `let`, and `const`

- **`var`**
    - Function-scoped
    - Can be re-declared and re-assigned
    - Hoisted and initialized with `undefined`

- **`let`**
    - Block-scoped
    - Cannot be re-declared in the same scope
    - Can be re-assigned
    - Hoisted but not initialized

- **`const`**
    - Block-scoped
    - Cannot be re-declared or re-assigned
    - Must be initialized at declaration time

### Example

```js
var x = 10;
var x = 20; // Allowed

let y = 10;
let y = 20; // Error
y = 15; // Allowed

const z = 10;
z = 20; // Error
```

---

## 2. Difference between `map()`, `forEach()`, and `filter()`

- **`map()`**
    - Creates a new array
    - Transforms each element
    - Does not modify the original array

- **`forEach()`**
    - Executes a function for each element
    - Does not return a new array
    - Commonly used for side effects like logging

- **`filter()`**
    - Creates a new array
    - Returns elements that match a condition
    - Does not modify the original array

### Examples

```js
const numbers = [1, 2, 3, 4];

const doubled = numbers.map((n) => n * 2); // [2, 4, 6, 8]

numbers.forEach((n) => console.log(n)); // Logs each number

const evens = numbers.filter((n) => n % 2 === 0); // [2, 4]
```

---

## 3. Arrow Functions in ES6

Arrow functions provide a shorter syntax for writing functions and do not have their own `this` context.

### Syntax:

```js
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;
```

---

## 4. Destructuring Assignment in ES6

Destructuring allows unpacking values from arrays or properties from objects into distinct variables.

### Array Destructuring:

```js
const colors = ["red", "blue", "green"];
const [first, second] = colors;

console.log(first); // red
console.log(second); // blue
```

### Object Destructuring:

```js
const user = { name: "Alex", age: 25 };
const { name, age } = user;

console.log(name); // Alex
console.log(age); // 25
```

---

## 5. Template Literals in ES6

Template literals allow embedded expressions and multi‑line strings using backticks (`` ` ``).

### Example:

```js
const name = "Sam";
const age = 30;

// Template literal
const message = `My name is ${name} and I am ${age} years old.`;
```

### Difference from String Concatenation:

**String Concatenation:**

```js
"My name is " + name + " and I am " + age + " years old.";
```

**Template Literals:**

- More readable
- Supports expressions
- Supports multi‑line strings

---
