import {describe, test, expect} from '@jest/globals'
import {UnsafeIntegralRing, ModularRing, xgcd, ExtensionRing, ResidueClasses, pow, GF, isZero, isOne, NumberElementStore} from './ff';

const gcd_number = (a: number, b: number): number => {
    if (b === 0) return a;
    return gcd_number(b, a % b)
}

describe('ff', () => {
    test('xgcd', () => {
        const R = UnsafeIntegralRing
        const a = R.fromZ(240)
        const b = R.fromZ(46)
        const [gcd, x, y] = xgcd(a, b)
        expect(gcd).toStrictEqual(R.fromZ(2))
    })
    test('inv', () => {
        const R = ModularRing(1000)
        const one = R.fromZ(1)
        for (let i = 1; i < R.modulo.number(); i++) {
            const x = R.fromZ(i)
            const y = x.minv()
            if (y === null) {
                expect(gcd_number(i, R.modulo.number())).not.toBe(1)
                continue
            }
            expect(x.mul(y)).toStrictEqual(one)
        }
    })
    test('ext fromZ', () => {
        const rings = [2, 3, 11].map(ModularRing)

        for (const R of rings) {
            const E = new ExtensionRing(R)
            for (let i = 0; i < 200; i++) {
                expect(E.fromZ(i).number()).toBe(i)
            }
        }
    })
    test('ext add', () => {
        const R = new ExtensionRing(ModularRing(2))
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
                expect(R.fromZ(i).add(R.fromZ(j)).number()).toBe(i ^ j)
            }
        }
    })
    test('ext equals', () => {
        const R = new ExtensionRing(ModularRing(3), "x")
        const n = 80
        const v = R.fromZ(n)
        const one = R.fromZ(1)
        expect(v.equals(v)).toBeTruthy()
        expect(v.equals(v.add(one))).toBeFalsy()
        expect(v.equals(v.add(one).add(one.ainv()))).toBeTruthy()
    })

    const testExtMulCases: [number, number, number, number][] = [
        [2, 0b101, 0b10, 0b1010],
        [2, 0b10, 0b101, 0b1010],
        [2, 0b101, 0, 0],
        [2, 0b11, 0b111, 0b1001],
    ]

    test('ext mul', () => {
        for (const [p, a, b, c] of testExtMulCases) {
            const R = new ExtensionRing(ModularRing(p), "x")
            const A = R.fromZ(a)
            const B = R.fromZ(b)
            const C = R.fromZ(c)
            expect(A.mul(B).equals(C)).toBeTruthy()
        }
    })
    test('ext divrem quot', () => {
        const rings = [2, 3, 13].map(ModularRing)
        for (const B of rings) {
            const R = new ExtensionRing(B)
            const one = R.fromZ(1)
            for (let i = 3; i < 100; i++) {
                const a = R.fromZ(i)
                const b = a.add(one)
                const c = a.mul(b)

                let v = c.divrem(a)
                expect(v).not.toBeNull()
                const [q, r] = v!
                expect(q.equals(b)).toBeTruthy()
                expect(isZero(r)).toBeTruthy()

                v = c.divrem(a)
                expect(v).not.toBeNull()
                const [q1, r1] = v!
                expect(q1.equals(b)).toBeTruthy()
                expect(isZero(r1)).toBeTruthy()
            }
        }
    })
    test('inv and ord GF(2^3)', () => {
        const GF2 = ModularRing(2)
        const E = new ExtensionRing(GF2, "x")
        const y = E.fromZ(2)
        const GF8 = new ResidueClasses(y.mul(y).mul(y).add(y).add(E.fromZ(1)))
        const x = GF8.fromZ(2)
        let acc = x
        for (let i = 0; i < 6; i++) {
            expect(isOne(acc)).toBeFalsy()
            expect(isZero(acc)).toBeFalsy()
            acc = acc.mul(x)
        }
        expect(isOne(acc)).toBeTruthy()
        
        for (let i = 1; i < 8; i++) {
            const el = GF8.fromZ(i)
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
        }
    })
    test('pow inv and ord GF(2^3)', () => {
        const GF2 = ModularRing(2)
        const E = new ExtensionRing(GF2, "x")
        const y = E.fromZ(2)
        const GF8 = new ResidueClasses(y.mul(y).mul(y).add(y).add(E.fromZ(1)))
        const x = GF8.fromZ(2)
        for (let i = 1; i < 7; i++) {
            expect(isOne(pow(x, i))).toBeFalsy()
            expect(isZero(pow(x, i))).toBeFalsy()
        }
        expect(isOne(pow(x, 7))).toBeTruthy()
        
        for (let i = 1; i < 8; i++) {
            const el = pow(x, i)
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
        }
    })
    test("GF(8)", () => {
        const GF8 = GF([2, 3])
        const x = GF8.fromZ(2)
        for (let i = 1; i < 7; i++) {
            expect(isOne(pow(x, i))).toBeFalsy()
            expect(isZero(pow(x, i))).toBeFalsy()
        }
        expect(isOne(pow(x, 7))).toBeTruthy()
        
        for (let i = 1; i < 8; i++) {
            const el = pow(x, i)
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
        }
    })
    test("GF(9)", () => {
        const p = 3
        const F = GF([p, 2], {
            symbol: "x",
        })
        const x = F.fromZ(p)
        for (let i = 1; i < F.order(); i++) {
            const el = pow(x, i)
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
        }
    })
    test("extension of extension", () => {
        const GF4 = GF([2, 2])
        const E = new ExtensionRing(GF4, "x", NumberElementStore as any)
        const y = E.fromZ(4)
        const GF8 = new ResidueClasses(y.mul(y).add(y).add(E.fromZ(3)))
        // for (let i = 0; i < 8; i++) {
        //     console.log(GF8.fromZ(i).element.at(0).number())
        // }
        for (let i = 1; i < 8; i++) {
            const el = GF8.fromZ(i)
            const inv = el.minv()
            expect(isOne(inv?.mul(el) ?? GF8.fromZ(0))).toBeTruthy()
        }
    })
    test("big field", () => {
        const p = 1009
        const F = GF(p)
        for (let i = 1; i < F.order(); i++) {
            const el = F.fromZ(i)
            expect(isOne(el.minv()?.mul(el) ?? F.fromZ(0))).toBeTruthy()
        }
    })
    test("big ext", () => {
        const p = 31
        const F = GF([p, 2])
        const x = F.fromZ(p)
        let count = 0
        for (let el = x; !isOne(el); el = el.mul(x)) {
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
            count++
        }
        expect(count).toBe(p*p-2)
    })
    test("big bin ext just GF", () => {
        const p = 2
        const F = GF([p, 10])
        expect(F.order()).toBe(1024n)
    })
    test("big bin ext", () => {
        const p = 2
        const F = GF([p, 10])
        const x = F.fromZ(p)
        let count = 0
        for (let el = x; !isOne(el); el = el.mul(x)) {
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
            count++
        }
        expect(count).toBe(1022)
    })
    test("big bin ext precalc", () => {
        const p = 2
        const F = GF([p, 10], {
            usePrecalculatedField: true,
        })
        const x = F.fromZ(p)
        let count = 0
        for (let el = x; !isOne(el); el = el.mul(x)) {
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
            count++
        }
        expect(count).toBe(1022)
    })
    test("ternary extension", () => {
        const p = 3
        const F = GF([p, 7], {
            polynomial: ["random", 123],
        })
        const x = F.fromZ(p)
        let count = 1
        for (let el = x; !isOne(el); el = el.mul(x)) {
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
            count++
        }
        expect(count).toBe(2187-1)
    })
    test("big nonbin ext", () => {
        const p = 31
        const F = GF([p, 5])
        const x = F.fromZ(p)
        for (let i = 1; i < 1_000; i++) {
            const el = pow(x, 37*i+5)
            expect(isOne(el.minv()?.mul(el) ?? x)).toBeTruthy()
        }
    })
    test("randgen params for js number type", () => {
        const M = 1 << 32
        const A = 1664525
        const C = 1013904223
        expect(A * (M - 1) + C <= Number.MAX_SAFE_INTEGER).toBeTruthy()
    })
})
