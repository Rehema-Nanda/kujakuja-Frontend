const fromEntries = require("fromentries"); // https://github.com/feross/fromentries

if (!Object.fromEntries) {
    Object.defineProperty(Object, "fromEntries", {
        configurable: true,
        enumerable: false,
        value: fromEntries,
        writable: true,
    });
}
