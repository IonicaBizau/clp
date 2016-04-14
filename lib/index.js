"use strict";

const isNumber = require("is-number")
    , matchIt = require("match-it")
    , lastChar = require("last-char")
    ;

// Part of the code from this file was originally written by
// the contributors in https://github.com/substack/minimist
function hasKey (obj, keys) {
    let o = obj;
    keys.slice(0,-1).forEach(function (key) {
        o = (o[key] || {});
    });

    let key = keys[keys.length - 1];
    return key in o;
}

/**
 * clp
 * Parses the cli arguments.
 *
 * @name clp
 * @function
 * @param {Array} args The arguments to parse (default: the process arguments).
 * @returns {Object} An object containing the parsed arguments.
 */
module.exports = function clp (args) {
    args = args || process.argv.slice(2);

    let flags = {
          bools : {}
        , strings : {}
        }
      , argv = { _ : [] }
      , notFlags = []
      , dashDashIndex = args.indexOf("--")
      ;

    function argDefined(key, arg) {
        return (flags.allBools && /^--[^=]+$/.test(arg))
            || flags.strings[key] || flags.bools[key] || aliases[key]
             ;
    }

    function setArg (key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }

        let value = !flags.strings[key] && isNumber(val)
                  ? Number(val) : val
                  ;

        setKey(argv, key.split("."), value);
    }

    function setKey (obj, keys, value) {
        let o = obj;
        keys.slice(0,-1).forEach(function (key) {
            if (o[key] === undefined) o[key] = {};
            o = o[key];
        });

        let key = keys[keys.length - 1];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === "boolean") {
            o[key] = value;
        }
        else if (Array.isArray(o[key])) {
            o[key].push(value);
        }
        else {
            o[key] = [ o[key], value ];
        }
    }

    function aliasIsBoolean(key) {
      return aliases[key].some(function (x) {
          return flags.bools[x];
      });
    }

    if (~dashDashIndex) {
        notFlags = args.slice(dashDashIndex + 1);
        args = args.slice(0, dashDashIndex);
    }


    for (let i = 0; i < args.length; ++i) {
        let arg = args[i]
          , oneOf = {
                doubleDashEqual: matchIt(arg, /^--([^=]+)=([\s\S]*)$/)
              , negative: matchIt(arg, /^--no-(.+)/)
              , doubleDash: matchIt(arg, /^--(.+)/)
            }
          ;

        if (oneOf.doubleDashEqual.length) {
            let key = oneOf.doubleDashEqual[1]
              , value = oneOf.doubleDashEqual[2]
              ;

            setArg(key, value, arg);
        } else if (oneOf.negative.length) {
            setArg(oneOf.negative[1], false, arg);
        } else if (oneOf.doubleDash.length) {
            let key = oneOf.doubleDash[1]
              , next = args[i + 1]
              ;

            if (next !== undefined && next.charAt(0) !== "-") {
                setArg(key, next, arg);
                i++;
            } else {
                let isTrue = next === "true";
                if (isTrue || next === "false") {
                    setArg(key, isTrue, arg);
                    i++;
                } else {
                    setArg(key, flags.strings[key] ? "" : true, arg);
                }
            }
        } else if (/^-[^-]+/.test(arg)) {
            let letters = arg.slice(1,-1).split("")
              , broken = false
              ;

            for (let j = 0; j < letters.length; ++j) {
                let next = arg.slice(j + 2)
                  , cLetter = letters[j]
                  ;

                if (next === "-") {
                    setArg(cLetter, next, arg)
                    continue;
                }

                if (/[A-Za-z]/.test(cLetter) && next.includes("=")) {
                    setArg(cLetter, next.split("=")[1], arg);
                    broken = true;
                    break;
                }

                if (/[A-Za-z]/.test(cLetter) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(cLetter, next, arg);
                    broken = true;
                    break;
                }

                let nextLetter = letters[j + 1];
                if (nextLetter && nextLetter.match(/\W/)) {
                    setArg(cLetter, next, arg);
                    broken = true;
                    break;
                } else {
                    setArg(cLetter, flags.strings[cLetter] ? "" : true, arg);
                }
            }

            let key = lastChar(arg);
            if (!broken && key !== "-") {
                let nextArg = args[i + 1];
                if (nextArg && !/^(-|--)[^-]/.test(nextArg)) {
                    setArg(key, args[i+1], arg);
                    i++;
                } else if (nextArg && /true|false/.test(nextArg)) {
                    setArg(key, nextArg === "true", arg);
                    i++;
                } else {
                    setArg(key, true, arg);
                }
            }
        } else {
            argv._.push(
                flags.strings["_"] || !isNumber(arg) ? arg : Number(arg)
            );
        }
    }

    notFlags.forEach(function(key) {
        argv._.push(key);
    });

    return argv;
};
