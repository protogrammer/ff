# Finite fields for javascript/typescript

The package provides objects, classes and functions for working with finite field arithmetics.

## Example

```typescript
import { GF, isOne, pow } from './ff';

const [p, m] = [3, 2]
const F = GF([p, m])
console.log("F: " + F)
console.log("0: " + F.fromZ(0))
const a = F.fromZ(p)
for (let i = 0; i === 0 || !isOne(pow(a, i)); i++) {
    console.log("a^" + i + ": " + pow(a, i))
}
```
