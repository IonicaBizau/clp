#!/usr/bin/env node

const clp = require("../lib");

console.log(clp(["grep", "-ri", "foo"]));
// { _: [ 'grep' ], r: true, i: 'foo' }

console.log(clp(["--name", "Johnny", "-a", "20", "--location", "Earth", "--no-student"]));
// { _: [], name: 'Johnny', a: 20, location: 'Earth', student: false }
