"use strict";

const tester = require("tester")
    , clp = require("..")
    ;

tester.describe("clp", test => {

    test.should("parse complex options", () => {
	test.expect(clp(["x", "-fo", "--test", "bar"])).toEqual({
            f: true,
            o: true,
            test: "bar",
	    _ : ["x"]
	});
    });

    test.should("handle --", () => {
	test.expect(clp(["-f", "--", "-fo", "--test", "bar"])).toEqual({
            f: true,
	    _ : ["-fo", "--test", "bar"]
	});
    });

    test.it("boolean options", () => {
	var argv = clp([ "-x", "-z", "one", "two", "three" ]);
	test.expect(argv).toEqual({
	    x: true,
	    z: "one",
	    _ : [ "two", "three" ]
	});
    });

    test.it("boolean and --x=true", () => {
	var parsed = clp(["--boool", "--other=true"]);

	test.expect(parsed.boool).toBe(true);
	test.expect(parsed.other).toBe("true");

	parsed = clp(["--boool", "--other=false"]);
	test.expect(parsed.boool).toEqual(true);
	test.expect(parsed.other).toEqual("false");
    });
});
