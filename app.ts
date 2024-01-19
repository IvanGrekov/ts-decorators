let deps = new Map();

function CacheMethod<
    T,
    A extends Array<string | number | Array<string | number>>,
    R,
>(
    target: (...args: A) => R,
    context: ClassMethodDecoratorContext<T, typeof target>
) {
    console.log('CacheMethod');
    const cache = new Map();

    return function(this: T, ...args: A) {
        const key = args.join('-');

        if (cache.has(key)) {
            console.log('cache hit');
            return cache.get(key);
        }

        console.log('cache miss')
        const result = target.apply(this, args);
        cache.set(key, result);

        return result
    }
}

function Max(num: number) {
    return function<T, A extends number[], R>(
        target: (...args: A) => R,
        context: ClassMethodDecoratorContext<T, typeof target>
    ) { 
        console.log('Max');
        return function(this: T, ...args: A) {
            for (const argument of args) {
                if (argument > num) {
                    throw new Error(`Argument ${argument} is greater than max num - ${num}`)
                }
            }

            const result = target.apply(this, args);

            return result
        }
    }
}

function Singleton<
    T extends { new (...args: any[]): {} },
>(
    constructor: T,
    context: ClassDecoratorContext<typeof constructor>
) {
    console.log('Singleton');
    
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);

            if (!deps.has(constructor)) {
                deps.set(constructor, this);
            }

            return deps.get(constructor);
        }
    };
}

function Readonly<T>(
    target: T,
    context: ClassFieldDecoratorContext<T, string>,
) {
    console.log('Readonly');

    return function(value: any) {            
        return `${value}(readonly)`;
    }
}

function CapitalizedStringSetter<T>(
    target: (this: T, value: string) => void,
    context: ClassSetterDecoratorContext<T, string>
) { 
    console.log('CapitalizedStringSetter');
    return function(this: T, value: string) {
        const capitalizedValue = value[0].toUpperCase() + value.slice(1).toLowerCase();
        const result = target.call(this, capitalizedValue);

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
