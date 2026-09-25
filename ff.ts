export type BaseRingElement<E extends BaseRingElement<E, R>, R extends BaseRing<E, R>> = {
    add(other: E): E,
    ainv(): E,
    mul(other: E): E,
    equals(other: E): boolean,
    getRing(): R
    number(): number
    bigint(): bigint
}

export type BaseRing<E extends BaseRingElement<E, R>, R extends BaseRing<E, R>> = { 
    fromZ(x: number | bigint): E,
}

export const zero = <E extends BaseRingElement<E, R>, R extends BaseRing<E, R>>(r: R): E => {
    return r.fromZ(0)
}

export const one = <E extends BaseRingElement<E, R>, R extends BaseRing<E, R>>(r: R): E => {
    return r.fromZ(1)
}

export const isZero = <E extends BaseRingElement<E, R>, R extends BaseRing<E, R>>(el: E): boolean => {
    return el.equals(zero(el.getRing()))
}

export const isOne = <E extends BaseRingElement<E, R>, R extends BaseRing<E, R>>(el: E): boolean => {
    return el.equals(one(el.getRing()))
}


export type RingElement<E extends RingElement<E, R>, R extends Ring<E, R>> = BaseRingElement<E, R> & {
    minv(): E | null,
}

export type Ring<E extends RingElement<E, R>, R extends Ring<E, R>> = BaseRing<E, R> 

export type FiniteRing<E extends BaseRingElement<E, R>, R extends BaseRing<E, R>> = R & {
    order(): bigint
}

export type EuclideanRingElement<E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>> = BaseRingElement<E, R> & {
    divrem(other: E): [E, E] | null,
}

export type EuclideanRing<E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>> = BaseRing<E, R>


export const xgcd = <E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>>(a: E, b: E): [E, E, E] => {
    const ring = a.getRing()
    const zero = ring.fromZ(0)
    const one = ring.fromZ(1)

    let r0 = a
    let s0 = one
    let t0 = zero
    
    let r1 = b
    let s1 = zero
    let t1 = one

    for (;;) {
        const res = r0.divrem(r1)
        if (res == null) {
            break
        }
        const [q, r2] = res;
        const s2 = s0.add(q.mul(s1).ainv())
        const t2 = t0.add(q.mul(t1).ainv())

        r0 = r1
        s0 = s1
        t0 = t1

        r1 = r2
        s1 = s2
        t1 = t2
    }

    return [r0, s0, t0]
}

export const gcd = <E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>>(a: E, b: E): E => {
    const ring = a.getRing()
    let r0 = a
    let r1 = b
    for (;;) {
        const res = r0.divrem(r1)
        if (res == null) {
            break
        }
        r0 = r1
        r1 = res[1]
    }

    return r0
}

class IntegralRingClass implements EuclideanRing<Integral, IntegralRingClass> {
    fromZ(x: number | bigint): Integral {
        return new Integral(BigInt(x))
    }
    toString(): string {
        return "integral ring"
    }
}

export const IntegralRing = new IntegralRingClass

export class Integral implements EuclideanRingElement<Integral, IntegralRingClass> {
    constructor(value: bigint = 0n) {
        this.value = value
    }
    readonly value: bigint
    add(other: Integral): Integral {
        return new Integral(this.value + other.value)
    }
    ainv(): Integral {
        return new Integral(-this.value)
    }
    mul(other: Integral): Integral {
        return new Integral(this.value * other.value)
    }
    divrem(other: Integral): [Integral, Integral] | null {
        if (other.value === 0n) {
            return null;
        }

        let a = this.value
        let b = other.value
        if (b < 0) {
            a = -a
            b = -b
        }
        if (a < 0) {
            a = a - a * b
        }
        return [new Integral(a / b), new Integral(a % b)]
    }
    equals(other: Integral): boolean {
        return this.value === other.value
    }
    getRing(): IntegralRingClass {
        return IntegralRing
    }
    toString(): string {
        return String(this.value)
    }
    number(): number {
        return Number(this.value)
    }
    bigint(): bigint {
        return this.value
    }
}

class UnsafeIntegralRingClass implements EuclideanRing<UnsafeIntegral, UnsafeIntegralRingClass> {
    fromZ(x: number | bigint): UnsafeIntegral {
        return new UnsafeIntegral(Number(x))
    }
    toString(): string {
        return "integral ring (unsafe)"
    }
}

export const UnsafeIntegralRing = new UnsafeIntegralRingClass

export class UnsafeIntegral implements EuclideanRingElement<UnsafeIntegral, UnsafeIntegralRingClass> {
    constructor(value: number = 0) {
        this.value = value
    }
    readonly value: number
    add(other: UnsafeIntegral): UnsafeIntegral {
        return new UnsafeIntegral(this.value + other.value)
    }
    ainv(): UnsafeIntegral {
        return new UnsafeIntegral(-this.value)
    }
    mul(other: UnsafeIntegral): UnsafeIntegral {
        return new UnsafeIntegral(this.value * other.value)
    }
    divrem(other: UnsafeIntegral): [UnsafeIntegral, UnsafeIntegral] | null {
        if (other.value === 0) {
            return null;
        }

        let a = this.value
        let b = other.value
        if (b < 0) {
            a = -a
            b = -b
        }
        if (a < 0) {
            a = a - a * b
        }
        return [new UnsafeIntegral(~~(a / b)), new UnsafeIntegral(a % b)]
    }
    equals(other: UnsafeIntegral): boolean {
        return this.value === other.value
    }
    getRing(): UnsafeIntegralRingClass {
        return UnsafeIntegralRing
    }
    toString(): string {
        return String(this.value)
    }
    number(): number {
        return this.value
    }
    bigint(): bigint {
        return BigInt(this.value)
    }
}

export class ResidueClassesElement<E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>> implements RingElement<ResidueClassesElement<E, R>, FiniteRing<ResidueClassesElement<E, R>, ResidueClasses<E, R>>> {
    readonly element: E
    readonly ring: ResidueClasses<E, R>
    #minvCheck: (e: E) => boolean
    constructor(element: E, ring: ResidueClasses<E, R>) {
        const res = element.divrem(ring.modulo);
        if (res == null) {
            throw new SyntaxError('ring modulo is incorrect!')
        }
        this.element = res[1];
        this.ring = ring
        this.#minvCheck = ring.modulo instanceof ExtensionElement
            ? (e: E) => (e as any).degree() !== 0
            : (e: E) => !isOne(e)
    }
    add(other: ResidueClassesElement<E, R>): ResidueClassesElement<E, R> {
        return new ResidueClassesElement(this.element.add(other.element), this.ring)
    }
    ainv(): ResidueClassesElement<E, R> {
        return new ResidueClassesElement(this.ring.modulo.add(this.element.ainv()), this.ring)
    }
    mul(other: ResidueClassesElement<E, R>): ResidueClassesElement<E, R> {
        return new ResidueClassesElement(this.element.mul(other.element), this.ring)
    }
    minv(): ResidueClassesElement<E, R> | null {
        const [gcd, _, inv] = xgcd(this.ring.modulo, this.element)
        if (this.#minvCheck(gcd)) {
            return null
        }
        if (gcd instanceof ExtensionElement) {
            const gcdBaseInv = gcd.at(0).minv()
            if (gcdBaseInv == null) {
                return null
            }
            const gcdInv = (gcd.getRing() as any).fromBase(gcdBaseInv)
            return new ResidueClassesElement(inv.mul(gcdInv), this.ring)
        }
        return new ResidueClassesElement(inv, this.ring)
    }
    equals(other: ResidueClassesElement<E, R>): boolean {
        return this.ring.modulo.equals(other.ring.modulo) && this.element.equals(other.element)
    }
    getRing(): ResidueClasses<E, R> {
        return this.ring
    }
    number(): number {
        return this.element.number()
    }
    bigint(): bigint {
        return this.element.bigint()
    }
    toString(): string {
        return this.element.toString()
    }
}

export class ResidueClasses<E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>> implements FiniteRing<RingElement<ResidueClassesElement<E, R>, ResidueClasses<E, R>>, Ring<ResidueClassesElement<E, R>, ResidueClasses<E, R>>> {
    readonly modulo: E
    #order?: bigint
    constructor(modulo: E) {
        this.modulo = modulo
    }
    fromZ(x: number | bigint): ResidueClassesElement<E, R> {
        return new ResidueClassesElement(this.modulo.getRing().fromZ(x), this)
    }
    order(): bigint {
        if (this.#order == null) {
            if (this.modulo instanceof ExtensionElement) {
                this.#order = pow(IntegralRing.fromZ(this.modulo.getBaseRing().order()), this.modulo.degree()).value
            } else {
                this.#order = this.modulo.bigint()
            }
        }
        return this.#order
    }
    toString(): string {
        return "residue classes mod " + this.modulo.toString()
    }
}

const MaxNumberMod: number = Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)) + 1

export type Modular = ResidueClassesElement<UnsafeIntegral | Integral, UnsafeIntegralRingClass | IntegralRingClass>

export type ModularRing = ResidueClasses<UnsafeIntegral | Integral, UnsafeIntegralRingClass | IntegralRingClass>
export const ModularRing = (x: bigint | number): ModularRing => {
    if (x <= MaxNumberMod) {
        return new ResidueClasses<UnsafeIntegral | Integral, UnsafeIntegralRingClass | IntegralRingClass>(UnsafeIntegralRing.fromZ(x))
    }
    return new ResidueClasses<UnsafeIntegral | Integral, UnsafeIntegralRingClass | IntegralRingClass>(IntegralRing.fromZ(x))
}

export const ringIsBinary = <E extends BaseRingElement<E, R>, R extends BaseRing<E, R>>(ring: BaseRing<E, R>): boolean => {
    if (ring instanceof ResidueClasses) {
        return ring.order() === 2n || ringIsBinary(ring.modulo.getRing())
    }
    if (ring instanceof ExtensionRing) {
        return ringIsBinary(ring.baseRing)
    }
    return false
}

export type RingElementStore<E extends RingElement<E, R>, R extends Ring<E, R>> = {
    baseRing(): R
    degree(): number
    at(degree: number): E
    nonZeroDegrees(): Generator<number, void, void>
    create(coeffs: E[] | [E, number][]): RingElementStore<E, R>
    add(other: RingElementStore<E, R>): RingElementStore<E, R>
    number(): number
    bigint(): bigint
}

type AdditionFunction = <E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>>(l: RingElementStore<E, R>, r: RingElementStore<E, R>) => RingElementStore<E, R>

const numberFromRingElementStore = <E extends RingElement<E, R>, R extends FiniteRing< E, Ring<E, R>>>(store: RingElementStore<E, R>): number => {
    const order = Number(store.baseRing().order())
    let acc = 0
    for (let i = store.degree(); i >= 0; i--) {
        acc = acc * order + store.at(i).number()
    }
    return acc
}

const bigintFromRingElementStore = <E extends RingElement<E, R>, R extends FiniteRing< E, Ring<E, R>>>(store: RingElementStore<E, R>): bigint => {
    const order = store.baseRing().order()
    let acc = 0n
    for (let i = store.degree(); i >= 0; i--) {
        acc = acc * order + store.at(i).bigint()
    }
    return acc
}

const elementwiseAdd: AdditionFunction = <E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>>(l: RingElementStore<E, R>, r: RingElementStore<E, R>): RingElementStore<E, R> => {
    const fst = l
    if (l.degree() > r.degree()) {
        [l, r] = [r, l]
    }
    const a = new Array<E>(r.degree())
    for (let i = 0; i <= l.degree(); i++) {
        a[i] = l.at(i).add(r.at(i))
    }
    for (let i = l.degree() + 1; i <= r.degree(); i++) {
        a[i] = r.at(i)
    }
    return fst.create(a)
}

const coeffArray = <E extends RingElement<E, R>, R extends Ring<E, R>>(store: RingElementStore<E, R>): E[] =>
    Array.from({ length: store.degree() + 1 }, store.at)

const sumDegree = <E extends RingElement<E, R>, R extends Ring<E, R>>(a: RingElementStore<E, R>, b: RingElementStore<E, R>): number => {
    let i = a.degree()
    let j = b.degree()
    if (i > j) {
        return i
    }
    if (i < j) {
        return j
    }
    while (i >= 0 && a.at(i).equals(b.at(i))) {
        i--
    }
    return i === -1 ? 0 : i
}

export type RingElementStoreConstructor<E extends RingElement<E, R>, R extends Ring<E, R>> = new (coeffs: E[] | [E, number][], ring: R) =>  RingElementStore<E, R>

const isDegreeArray = <T>(a: T[] | [T, number][]): a is [T, number][] => a.length === 0 || Array.isArray(a[0])

class BigintElementStoreInfo<E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>> {
    constructor(public ring: R, public bitsPerEl: number, public mask: bigint, public add: AdditionFunction, public isBinary: boolean) {}
}

const addBigIntElementStores: AdditionFunction = <E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>>(a: RingElementStore<E, R>, b: RingElementStore<E, R>): RingElementStore<E, R> =>
   (a instanceof BigintElementStore ? a : new BigintElementStore<E, R>(coeffArray(a), a.at(0).getRing())).binAdd(b)

export class BigintElementStore<E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>> implements RingElementStore<E, R> {
    #a: bigint
    #degree: number
    #info: BigintElementStoreInfo<E, R>

    constructor(coeffs: E[] | [E, number][], info: R | BigintElementStoreInfo<E, R>) {
        const n = coeffs.length
        this.#a = 0n
        this.#degree = 0
        const coeffsIsDegreeArray = isDegreeArray(coeffs)
        if (info instanceof BigintElementStoreInfo) {
            this.#info = info
        } else {
            const bitsPerEl = (info.order() - 1n).toString(2).length
            const isBinary = n > 0 && ringIsBinary((coeffsIsDegreeArray ? coeffs[0]![0] : coeffs[0]!).getRing())
            this.#info = new BigintElementStoreInfo(info, bitsPerEl,
                (1n << BigInt(bitsPerEl)) - 1n, isBinary ? addBigIntElementStores : elementwiseAdd, isBinary)
        }

        if (n === 0) {
            return
        }

        if (coeffsIsDegreeArray) {
            for (const [coeff, degree] of coeffs) {
                // TODO check equal degrees
                if (isZero(coeff)) {
                    continue
                }
                this.#a |= coeff.bigint() << BigInt(degree * this.#info.bitsPerEl)
                this.#degree = Math.max(this.#degree, degree)
            }
            return
        }

        this.#degree = n - 1
        while (this.#degree >= 0 && isZero(coeffs[this.#degree]!)) {
            this.#degree--
        }
        if (this.#degree < 0) {
            this.#degree = 0
            return
        }
        coeffs.length = this.#degree + 1
        for (const [degree, coeff] of coeffs.entries()) {
            this.#a |= coeff.bigint() << BigInt(degree * this.#info.bitsPerEl)
        }
    }
    baseRing(): R {
        return this.#info.ring
    }
    number(): number {
        if (this.#info.isBinary)
            return Number(this.#a)
        return numberFromRingElementStore(this)
    }
    bigint(): bigint {
        if (this.#info.isBinary)
            return this.#a
        return bigintFromRingElementStore(this)
    }
    degree(): number {
        return this.#degree
    }
    at(degree: number): E {
        return this.#info.ring.fromZ((this.#a >> BigInt(degree * this.#info.bitsPerEl)) & this.#info.mask)
    }
    *nonZeroDegrees(): Generator<number, void, void> {
        for (let degree = 0; degree <= this.#degree; degree++) {
            if ((this.#a & (this.#info.mask << BigInt(degree * this.#info.bitsPerEl))) !== 0n) {
                yield degree
            }
        }
    }

    create(coeffs: E[] | [E, number][]): BigintElementStore<E, R> {
        return new BigintElementStore(coeffs, this.#info)
    }

    binAdd(other: RingElementStore<E, R>): RingElementStore<E, R> {
        const safeOther: BigintElementStore<any, any> = other instanceof BigintElementStore ? other : this.create(coeffArray(other))
        const result = this.create([])
        result.#a = this.#a ^ safeOther.#a
        result.#degree = sumDegree(this, safeOther)
        return result
    }

    add(other: RingElementStore<E, R>): RingElementStore<E, R> {
        return this.#info.add(this, other)
    }
}

class NumberElementStoreInfo<E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>> {
    constructor(public ring: R, public bitsPerEl: number, public mask: number, public add: AdditionFunction, public isBinary: boolean) {}
}

const addNumberElementStores: AdditionFunction = <E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>>(a: RingElementStore<E, R>, b: RingElementStore<E, R>): RingElementStore<E, R> =>
   (a instanceof NumberElementStore ? a : new NumberElementStore<E, R>(coeffArray(a), a.at(0).getRing())).binAdd(b)


export class NumberElementStore<E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>> implements RingElementStore<E, R> {
    #a: number
    #degree: number
    #info: NumberElementStoreInfo<E, R>

    constructor(coeffs: E[] | [E, number][], info: R | NumberElementStoreInfo<E, R>) {
        const n = coeffs.length
        this.#a = 0
        this.#degree = 0
        const coeffsIsDegreeArray = isDegreeArray(coeffs)
        if (info instanceof NumberElementStoreInfo) {
            this.#info = info
        } else {
            const bitsPerEl = (info.order() - 1n).toString(2).length
            const isBinary = n > 0 && ringIsBinary((coeffsIsDegreeArray ? coeffs[0]![0] : coeffs[0]!).getRing())
            this.#info = new NumberElementStoreInfo(info, bitsPerEl, (1 << bitsPerEl) - 1, isBinary ? addNumberElementStores : elementwiseAdd, isBinary)
        }

        if (n === 0) {
            return
        }

        if (coeffsIsDegreeArray) {
            for (const [coeff, degree] of coeffs) {
                // TODO check equal degrees
                if (isZero(coeff)) {
                    continue
                }
                this.#a |= coeff.number() << (degree * this.#info.bitsPerEl)
                this.#degree = Math.max(this.#degree, degree)
            }
            return
        }

        this.#degree = n - 1
        while (this.#degree >= 0 && isZero(coeffs[this.#degree]!)) {
            this.#degree--
        }
        if (this.#degree < 0) {
            this.#degree = 0
            return
        }
        coeffs.length = this.#degree + 1
        for (const [degree, coeff] of coeffs.entries()) {
            this.#a |= coeff.number() << degree * this.#info.bitsPerEl
        }
    }
    baseRing(): R {
        return this.#info.ring
    }
    number(): number {
        if (this.#info.isBinary)
            return this.#a
        return numberFromRingElementStore(this)
    }
    bigint(): bigint {
        if (this.#info.isBinary)
            return BigInt(this.#a)
        return bigintFromRingElementStore(this)
    }
    degree(): number {
        return this.#degree
    }
    at(degree: number): E {
        return this.#info.ring.fromZ((this.#a >> (degree * this.#info.bitsPerEl)) & this.#info.mask)
    }
    *nonZeroDegrees(): Generator<number, void, void> {
        for (let degree = 0; degree <= this.#degree; degree++) {
            if ((this.#a & (this.#info.mask << (degree * this.#info.bitsPerEl))) !== 0) {
                yield degree
            }
        }
    }
    create(coeffs: E[] | [E, number][]): NumberElementStore<E, R> {
        return new NumberElementStore(coeffs, this.#info)
    }

    binAdd(other: RingElementStore<E, R>): RingElementStore<E, R> {
        const safeOther = other instanceof NumberElementStore ? other : this.create(coeffArray(other))
        const result = this.create([])
        result.#a = this.#a ^ safeOther.#a
        result.#degree = sumDegree(this, safeOther)
        // if (result.#a !== (elementwiseAdd(this, other) as NumberElementStore<E, R>).#a || result.#degree !== (elementwiseAdd(this, other) as NumberElementStore<E, R>).#degree) {
        //     console.log("this.#a = " + this.#a)
        //     console.log("other.#a = " + (other as NumberElementStore<E, R>).#a)
        //     console.log("safeOther.#a = " + safeOther.#a)
        //     console.log("result.#a = " + result.#a)
        //     console.log("result.#degree = " + result.#degree)
        //     console.log("elementwise sum = " + (elementwiseAdd(this, other) as NumberElementStore<E, R>).#a)
        //     console.log("elementwise sum degree = " + (elementwiseAdd(this, other) as NumberElementStore<E, R>).#degree)
        //     throw new Error('fu')
        // }
        return result
    }

    add(other: RingElementStore<E, R>): RingElementStore<E, R> {
        return this.#info.add(this, other)
    }
}


export class ArrayElementStore<E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>> implements RingElementStore<E, R> {
    #a: E[]
    #zero: E

    constructor(coeffs: E[] | [E, number][], ring: R) {
        this.#zero= ring.fromZ(0)
        if (isDegreeArray(coeffs)) {
            let maxDegree = 0
            for (const [coeff, degree] of coeffs)
                if (degree > maxDegree && !isZero(coeff))
                    maxDegree = degree
            this.#a = Array.from({ length: maxDegree + 1 }, () => this.#zero)
            for (const [coeff, degree] of coeffs) {
                // TODO check equal degrees
                if (isZero(coeff))
                    continue
                this.#a[degree] = coeff
            }
            return
        }
        let degree = coeffs.length - 1
        while (degree >= 0 && isZero(coeffs[degree]!))
            degree--
        this.#a = Array.from({ length: degree + 1 })
        for (let i = 0; i <= degree; i++)
            this.#a[i] = coeffs[i]!
    }
    baseRing(): R {
        return this.#zero.getRing()
    }
    number(): number {
        return numberFromRingElementStore(this)
    }
    bigint(): bigint {
        return bigintFromRingElementStore(this)
    }
    degree(): number {
        return Math.max(this.#a.length - 1, 0)
    }
    at(degree: number): E {
        return this.#a[degree] ?? this.#zero
    }
    *nonZeroDegrees(): Generator<number, void, void> {
        for (const [i, el] of this.#a.entries()) {
            if (!isZero(el)) {
                yield i
            }
        }
    }
    create(coeffs: E[] | [E, number][]): ArrayElementStore<E, R> {
        return new ArrayElementStore(coeffs, this.#zero.getRing())
    }

    add(other: RingElementStore<E, R>): RingElementStore<E, R> {
        return elementwiseAdd(this, other)
    }
}

const processCoeff = (s: string, a: string, i: number): string => {
    const sndPart = i === 0 ? "" : i === 1 ? a : `${a}^${i}`
    if (s === "1" && i !== 0) {
        return sndPart
    }
    if (i !== 0 && s.search(/\+/) !== -1) {
        return "(" + s + ")" + sndPart
    }
    if (i === 0 || s.length === 1 || s.match(/^\d+$/)) {
        return s + sndPart
    }
    return s + " " + sndPart
}

export class ExtensionElement<E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>, BE extends RingElement<BE, BR>, BR extends FiniteRing<RingElement<BE, BR>, Ring<BE, BR>>> implements EuclideanRingElement<ExtensionElement<E, R, BE, BR>, ExtensionRing<E, R, BE, BR>> {
    #ring: ExtensionRing<E, R, BE, BR>
    #store: RingElementStore<BE, BR>
    
    constructor(ring: ExtensionRing<E, R, BE, BR>, store: RingElementStore<BE, BR>) {
        this.#ring = ring
        this.#store = store
    }
    
    add(other: ExtensionElement<E, R, BE, BR>): ExtensionElement<E, R, BE, BR> {
        return new ExtensionElement(this.#ring, this.#store.add(other.#store))
    }
    ainvGeneral(): ExtensionElement<E, R, BE, BR> {
        const a: [BE, number][] = []
        for (const i of this.#store.nonZeroDegrees()) {
            a.push([this.#store.at(i).ainv(), i])
        }
        return new ExtensionElement(this.#ring, this.#store.create(a))
    }
    ainv(): ExtensionElement<E, R, BE, BR> {
        return this.#ring.ainv(this)
    }
    mul(other: ExtensionElement<E, R, BE, BR>): ExtensionElement<E, R, BE, BR> {
        const degree = this.degree() + other.degree() + 1
        const a = new Array<BE>(degree).fill(this.getRing().baseRing.fromZ(0))
        for (const i of this.#store.nonZeroDegrees()) {
            for (const j of other.#store.nonZeroDegrees()) {
                a[i + j] = a[i + j]!.add(this.at(i).mul(other.at(j)))
            }
        }
        return new ExtensionElement(this.#ring, this.#store.create(a))
    }
    divrem(other: ExtensionElement<E, R, BE, BR>): [ExtensionElement<E, R, BE, BR>, ExtensionElement<E, R, BE, BR>] | null {
        // console.log("other: " + other.toString())
        let acc = this.getRing().fromZ(0)
        let resid: ExtensionElement<E, R, BE, BR> = this
        while (resid.degree() >= other.degree() && !isZero(resid)) {
            // console.log("resid: " + resid.toString())
            // console.log("acc: " + acc.toString())
            // console.log("other.degree(): " + other.degree())
            // console.log("other.at(other.degree()): " + other.at(other.degree()).toString())
            const coeff = other.at(other.degree()).minv()?.mul(resid.at(resid.degree()))
            if (coeff == null) {
                return null
            }
            const xn = new ExtensionElement(this.#ring, this.#store.create([[coeff, resid.degree() - other.degree()]]))
            acc = acc.add(xn)
            // const prevResid = resid
            resid = resid.add(other.mul(xn).ainv())
            // if (resid.degree() >= prevResid.degree() && !isZero(resid)) {
            //     console.log("prevResid: " + prevResid.toString())
            //     console.log("resid: " + resid.toString())
            //     console.log("acc: " + acc.toString())
            //     console.log("x^n: " + xn.toString())
            //     console.log("other.mul(xn): " + other.mul(xn))
            //     console.log("other.mul(xn).ainv(): " + other.mul(xn).ainv())
            //     throw new Error("Error resid: " + prevResid.toString() + " => " + resid.toString())
            // }
        }

        // if (!this.equals(acc.mul(other).add(resid))) {
        //     console.log(acc.mul(other).toString())
        //     console.log(acc.mul(other).add(resid).toString())
        //     console.log([this, acc, other, resid].map((x) => x.degree()))
        //     console.log([this, acc, other, resid].map((x) => (x.#store as any).getA()))
        //     throw Error(`division error: ${this.toString()} != (${acc.toString()}) * (${other.toString()}) + ${resid.toString()}`)
        // }

        return [acc, resid]
    }
    equals(other: ExtensionElement<E, R, BE, BR>): boolean {
        if (this.degree() !== other.degree()) {
            return false
        }
        const thisGen = this.#store.nonZeroDegrees()
        const otherGen = other.#store.nonZeroDegrees()
        while (true) {
            const thisNext = thisGen.next()
            const otherNext = otherGen.next()
            if (thisNext.done || otherNext.done) {
                return thisNext.done === otherNext.done
            }
            const i = thisNext.value
            const j = otherNext.value
            if (i !== j || !this.at(i).equals(other.at(j))) {
                return false
            }
        }
    }
    getRing(): ExtensionRing<E, R, BE, BR> {
        return this.#ring
    }
    getBaseRing(): BR {
        return this.#ring.baseRing
    }
    number(): number {
       return this.#store.number()
    }
    bigint(): bigint {
        return this.#store.bigint()
    }
    toString(): string {
        return Array.from(this.#store.nonZeroDegrees())
            .map((i) => processCoeff(this.at(i).toString(), this.#ring.symbol, i))
            .reverse()
            .join(' + ')
            || '0'
    }
    degree(): number {
        return this.#store.degree()
    }
    at(degree: number): BE {
        return this.#store.at(degree)
    }
}

export class ExtensionRing<E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>, BE extends RingElement<BE, BR>, BR extends FiniteRing<RingElement<BE, BR>, Ring<BE, BR>>> implements EuclideanRing<ExtensionElement<E, R, BE, BR>, ExtensionRing<E, R, BE, BR>> {
    readonly baseRing: BR
    readonly symbol: string
    readonly defaultElementStore: RingElementStoreConstructor<BE, BR>
    ainv: (el: ExtensionElement<E, R, BE, BR>) => ExtensionElement<E, R, BE, BR>
    
    constructor(baseRing: BR, symbol: string = "a", defaultElementStore?: RingElementStoreConstructor<BE, BR>) {
        this.baseRing = baseRing
        this.symbol = symbol
        this.defaultElementStore = defaultElementStore ?? ArrayElementStore<BE, BR>
        this.ainv = ringIsBinary(baseRing) ? (x) => x : (el) => el.ainvGeneral()
    }

    fromBase(el: BE, elementStore?: RingElementStoreConstructor<BE, BR>): ExtensionElement<E, R, BE, BR> {
        elementStore ??= this.defaultElementStore
        return new ExtensionElement(this, new elementStore([el], this.baseRing))
    }
    
    fromZ(x: number | bigint, elementStore?: RingElementStoreConstructor<BE, BR>): ExtensionElement<E, R, BE, BR> {
        elementStore ??= this.defaultElementStore
        x = BigInt(x)
        const order = this.baseRing.order()
        const elems: BE[] = []
        while (x !== 0n) {
            const r = x % order
            elems.push(this.baseRing.fromZ(r))
            x /= order
        }
        return new ExtensionElement(this, new elementStore(elems, this.baseRing))
    }
    getBase(): BR {
        return this.baseRing
    }
    toString(): string {
        return "extension ring over " + this.baseRing.toString()
    }
}


class PrecalculatedFieldElement<E extends RingElement<E, R>, R extends FiniteRing<E, Ring<E, R>>> implements RingElement<PrecalculatedFieldElement<E, R>, FiniteRing<PrecalculatedFieldElement<E, R>, PrecalculatedField<E, R>>> {
    readonly element: E
    constructor(readonly power: number, readonly ring: PrecalculatedField<E, R>) {
        if (this.power !== -1) {
            this.power %= this.ring.mulOrder
        }
        this.element = power === -1 ? this.ring.zeroElem : this.ring.elems[power]!
    }
    add(other: PrecalculatedFieldElement<E, R>): PrecalculatedFieldElement<E, R> {
        return new PrecalculatedFieldElement(this.ring.powers[this.element.add(other.element).number()]!, this.ring)
    }
    ainv(): PrecalculatedFieldElement<E, R> {
        return new PrecalculatedFieldElement(this.ring.powers[this.element.ainv().number()]!, this.ring)
    }
    mul(other: PrecalculatedFieldElement<E, R>): PrecalculatedFieldElement<E, R> {
        if (this.power === -1) return this
        if (other.power === -1) return other
        return new PrecalculatedFieldElement(this.power + other.power, this.ring)
    }
    minv(): PrecalculatedFieldElement<E, R> | null {
        if (this.power === -1) return null
        return new PrecalculatedFieldElement(this.ring.mulOrder - this.power, this.ring)
    }
    equals(other: PrecalculatedFieldElement<E, R>): boolean {
        return this.power === other.power
    }
    getRing(): PrecalculatedField<E, R> {
        return this.ring
    }
    number(): number {
        return this.element.number()
    }
    bigint(): bigint {
        return this.element.bigint()
    }
    toString(): string {
        return this.element.toString()
    }
}

class PrecalculatedField<E extends RingElement<E, R>, R extends FiniteRing<E, Ring<E, R>>> implements FiniteRing<RingElement<PrecalculatedFieldElement<E, R>, PrecalculatedField<E, R>>, Ring<PrecalculatedFieldElement<E, R>, PrecalculatedField<E, R>>> {
    readonly mulOrder: number
    readonly powers: number[]
    readonly elems: E[]
    readonly zeroElem: E
    readonly ring: R
    constructor(readonly g: E) {
        this.ring = g.getRing()
        this.elems = []
        this.mulOrder = 1
        const one = this.ring.fromZ(1)
        this.elems.push(one)
        let x = g
        while (!x.equals(one)) {
            this.elems.push(x)
            x = x.mul(g)
            this.mulOrder++
        }
        this.zeroElem = this.ring.fromZ(0)
        this.powers = new Array(this.mulOrder + 1)
        this.powers[this.ring.fromZ(0).number()] = -1
        for (const [i, x] of this.elems.entries()) {
            this.powers[x.number()] = i
        }
    }
    fromZ(x: number | bigint): PrecalculatedFieldElement<E, R> {
        return new PrecalculatedFieldElement(this.powers[this.ring.fromZ(x).number()]!, this)
    }
    order(): bigint {
        return this.ring.order()
    }
    toString(): string {
        return "precalculated " + this.ring.toString()
    }
}


export const primitiveElement = <E extends EuclideanRingElement<E, R>, R extends EuclideanRing<E, R>, BE extends RingElement<BE, BR>, BR extends FiniteRing<RingElement<BE, BR>, Ring<BE, BR>>>(r: ExtensionRing<E, R, BE, BR>): ExtensionElement<E, R, BE, BR> => {
    return r.fromZ(r.getBase().order())
}


export const pow = <E extends BaseRingElement<E, R>, R extends BaseRing<E, R>>(e: E, n: number | bigint): E => {
    n = BigInt(n)
    if (n === 0n) {
        return e.getRing().fromZ(1)
    }
    let a = pow(e, n / 2n)
    a = a.mul(a)
    if (n % 2n === 1n) {
        a = a.mul(e)
    }
    return a
}


const allPolynomials = function*(ring: ModularRing, degree: number): Generator<Modular[]> {
    const allPolynomialsRec = function*(n: number): Generator<Modular[]> {
        if (n === 0) {
            yield []
            return
        }
        for (let i = n === 1 ? 1 : 0; i < ring.order(); i++) {
            for (const polynomial of allPolynomialsRec(n - 1)) {
                yield [...polynomial, ring.fromZ(i)]
            }
        }
    }

    const one = ring.fromZ(1)

    for (const polynomial of allPolynomialsRec(degree)) {
        yield [...polynomial, one]
    }
}

// linear congruential random number generator from "numerical recipes"
const MBigInt = 1n << 32n
const M = Number(MBigInt)
const A = 1664525
const C = 1013904223

const randomPolynomials = function*(ring: ModularRing, degree: number, r: number): Generator<Modular[]> {
    const p = ring.order()
    while (true) {
        r = (A * r + C) % M
        const el = ((BigInt(r) * (p - 1n)) / MBigInt) + 1n
        const polynomial = [ring.fromZ(el)]
        for (let i = degree - 1; i > 0; i--) {
            r = (A * r + C) % M
            const el = (BigInt(r) * p) / MBigInt
            polynomial.push(ring.fromZ(el))
        }
        polynomial.push(ring.fromZ(1))
        yield polynomial
    }
}

const factor = (n: bigint): [bigint, number][] => {
    // TODO use faster factorization algorithms
    const divisors: [bigint, number][] = []
    if (n % 2n === 0n) {
        let count = 0
        while (n % 2n === 0n) {
            n /= 2n
            count += 1
        }
        divisors.push([2n, count])
    }
    for (let d = 3n; n !== 1n && d*d <= n; d += 2n) {
        if (n % d !== 0n) continue
        let count = 0
        while (n % d === 0n) {
            n /= d
            count += 1
        }
        divisors.push([d, count])
    }
    if (n !== 1n) {
        divisors.push([n, 1])
    }
    return divisors
}


const isGenerator = <E extends RingElement<E, R>, R extends FiniteRing<RingElement<E, R>, Ring<E, R>>>(x: E, n: bigint, nDivPrime: bigint[]): boolean => {
    if (!isOne(pow(x, n)))
        return false
    return nDivPrime.every((v) => !isOne(pow(x, v)))
}

const cachedPrimitivePolynomials: Map<[bigint, number], Modular[]> = new Map()

export type GaloisFieldProps = {
    symbol?: string,
    polynomial?: "first" | "random" | ["random", number] | Modular[],
    preferredStore?: RingElementStoreConstructor<any, any>,
    usePrecalculatedField?: boolean,
}

export const GF = (q: number | bigint | [number, number] | [bigint, number], props?: GaloisFieldProps): FiniteRing<RingElement<RingElement<RingElement<any, any>, Ring<any, any>>, Ring<RingElement<any, any>, Ring<any, any>>>, Ring<RingElement<RingElement<any, any>, Ring<any, any>>, Ring<RingElement<any, any>, Ring<any, any>>>> => {
    if (typeof q === "number" || typeof q === "bigint" || q[1] === 1) {
        if (Array.isArray(q)) q = q[0]
        if (!props?.usePrecalculatedField || q == 2)
            return ModularRing(q)
        q = BigInt(q)
        const R = ModularRing(q)
        const targetMulOrder = q - 1n
        const factors = factor(targetMulOrder)
        const nDivPrime = factors.map(([p, _]) => targetMulOrder / p)
        let gN = 2n
        while (true) {
            const g = R.fromZ(gN)
            if (isGenerator(g, targetMulOrder, nDivPrime)) 
                return new PrecalculatedField(g)
            gN++
        }
    }
    
    const p = BigInt(q[0])
    const m = q[1]


    props ??= {}
    props = { ...props }
    props.symbol ??= "a"
    props.polynomial ??= "first"

    const bitsPerEl = (p - 1n).toString(2).length
    props.preferredStore ??= ((1n << BigInt(bitsPerEl * (2*(m - 1) + 1)))-1n) < (1n << 32n) 
        ? NumberElementStore 
        : ArrayElementStore
    
    props.usePrecalculatedField ??= false

    // TODO check whether p is prime
    const baseRing = ModularRing(p)
    const extensionRing = new ExtensionRing(baseRing, props.symbol, props.preferredStore)

    if (Array.isArray(props.polynomial) && typeof props.polynomial[0] !== "string") {
        const modulo = new ExtensionElement(extensionRing, new props.preferredStore(props.polynomial, baseRing))
        const F = new ResidueClasses(modulo)
        return props.usePrecalculatedField ? new PrecalculatedField(F.fromZ(p)) : F
    }

    if (props.polynomial === "first") {
        const primitivePolynomial = cachedPrimitivePolynomials.get([p, m])
        if (primitivePolynomial != null) {
            const modulo = new ExtensionElement(extensionRing, new props.preferredStore(primitivePolynomial, baseRing))
            const F = new ResidueClasses(modulo)
            return props.usePrecalculatedField ? new PrecalculatedField(F.fromZ(p)) : F
        }
    }
    
    const targetMulOrder = pow(IntegralRing.fromZ(p), m).value - 1n
    const factors = factor(targetMulOrder)
    const nDivPrime = factors.map(([p, _]) => targetMulOrder / p)

    const polyGen = props.polynomial === "first" 
        ? allPolynomials(baseRing, m)
        : props.polynomial === "random"
        ? randomPolynomials(baseRing, m, 0)
        : randomPolynomials(baseRing, m, props.polynomial[1] as number)

    for (const polynomial of polyGen) {
        const modulo = new ExtensionElement(extensionRing, new props.preferredStore(polynomial, baseRing))
        const maybeField = new ResidueClasses(modulo)

        const x = maybeField.fromZ(p)
        if (!isGenerator(x, targetMulOrder, nDivPrime))
            continue

        // it's really a field!
        if (props.polynomial === "first") {
            cachedPrimitivePolynomials.set([p, m], polynomial)
        }
        return props.usePrecalculatedField ? new PrecalculatedField(x) : maybeField
    }

    throw new Error("unreachable")
}
