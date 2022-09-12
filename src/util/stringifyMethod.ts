// returns a string given to the eval() function for calling a specific method
// EXAMPLE: stringifyMethod('hello', 'world', 10) => 'hello("world",10)'

export default function (name: string, ...args: any) {
    return `${name}(${ args.filter((f:any) => f !== undefined).map((m: any) => JSON.stringify(m)).join() })`;
}