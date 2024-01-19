let deps = new Map();

function CacheMethod<
    T,
    A extends Array<string | number | Array<string | number>>,
    R,
>(
    method: (...args: A) => R,
    context: ClassMethodDecoratorContext<T, typeof method>
) {
    const cache = new Map();

    return function(this: T, ...args: A) {
        const key = args.join('-');

        if (cache.has(key)) {
            console.log('cache hit');
            return cache.get(key);
        }

        console.log('cache miss')
        const result = method.apply(this, args);
        cache.set(key, result);

        return result
    }
}

function Max(num: number) {
    return function<T, A extends number[], R>(
        method: (...args: A) => R,
        context: ClassMethodDecoratorContext<T, typeof method>
    ) { 
        return function(this: T, ...args: A) {
            for (const argument of args) {
                if (argument > num) {
                    throw new Error(`Argument ${argument} is greater than max num - ${num}`)
                }
            }

            return method.apply(this, args);
        }
    }
}

function Singleton<
    T extends { new (...args: any[]): {} },
>(
    constructor: T,
    context: ClassDecoratorContext<typeof constructor>
) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);

            if (deps.has(constructor)) {
                console.log('cache hit');
                return deps.get(constructor);
            }

            console.log('cache miss')
            deps.set(constructor, this);

            return this;
        }
    };
}

function Readonly<T>(
    target: T,
    context: ClassFieldDecoratorContext<T, string>,
) {
    return function(value: any) {            
        return `!${value}`;
    }
}

function CapitalizedStringSetter<T>(
    setter: (this: T, value: string) => void,
    context: ClassSetterDecoratorContext<T, string>
) {
    return function(this: T, value: string) {
        const capitalizedValue = value[0].toUpperCase() + value.slice(1).toLowerCase();
        const result = setter.call(this, capitalizedValue);

        return result
    }
}

@Singleton
class Calc {
    @Readonly
    name = 'Steve';

    private _surname = '';

    @CapitalizedStringSetter
    set surname(value: string) {
        this._surname = value;
    }

    get fullName() {
        return `${this.name} ${this._surname}`;
    }

    @CacheMethod
    @Max(10)
    exec(a: number, b: number) {
        return a + b
    }
}


const calc = new Calc();

// calc.exec(1, 2)
// calc.exec(2, 3)
// calc.exec(1, 2)
// calc.exec(10, 2)

// const calc1 = new Calc();
// console.log(calc === calc1);

// console.log(calc.name);

// calc.surname = 'johnson';
// console.log(calc.fullName);
