/*
 * A "simple" NodeJS REPL for a custom CLI app using repl (https://nodejs.org/api/repl.html)
 *   with custom commands, autocomplete for custom commands, persistent command history &
 *   "command history compression" (won't keep multiple instances in a row of the same command in the history)
 *
 * Author: l3l_aze <at> Yahoo!! (dot) com
 */

'use strict';

const fs = require('fs');
const path = require('path');
const repl = require('repl');
const debug = require('debug')(name);

const name = 'stylusdb-cli';

// Custom command setup
const fullCommands = {
    'clear': 'clear the screen',
    'quit': 'Exit the REPL',
    'exit': 'Exit the REPL',
    'set': 'Set a key-value pair',
    'get': 'Get the value of a key'
};

const commands = Object.keys(fullCommands);

// Create REPL
const server = repl.start({
    prompt: 'test-repl>',
    terminal: true, // Set to true to enable command history
    ignoreUndefined: true, // Ignore 'undefined' when running a command that does not return a value
    replMode: 'strict' // 'use strict'
});

// Setup REPL
function init() {
    process.stdout.write('\n'); // So The next debug line doesn't split into two lines, and doesn't start on the prompt line
    debug('Intializing %s', name);
    const replHistoryFile = path.join('./', '.node_repl_history');

    server.eval = customEval;
    server.completer = customAutocomplete;

    // Save command history when exiting
    server.on('exit', () => {
        debug('Closing %s...saving history', name);

        // server.lines = commands used in current session
        let data = server.lines;

        // Do not try to save history when there have been no commands run
        if (data.length > 0) {
            fs.appendFileSync(replHistoryFile, data.join('\n') + '\n');
        }

        process.exit();
    })

    // Obviously we don't want to try to load non-existent history.
    if (fs.existsSync(replHistoryFile)) {
        loadHistory(replHistoryFile);
    }
}

// Custom 'eval' for REPL, to handle custom commands
const customEval = function customEval(cmd, callback) {
    let result;
    cmd = cmd.trim();

    // Calling eval with an empty line below in the default case will cause it to be saved in command history.
    if (cmd === '') {
        return undefined;
    }

    switch (cmd) {
        case 'clear':
            process.stdout.cursorTo(0, 0); // Move to top line of terminal
            process.stdout.clearLine();
            process.stdout.clearScreenDown();
            server.lines.push(cmd); // Save known command in history
            break;

        case 'quit':
        case 'exit':
            // TODO: Implement a graceful shutdown
            server.lines.push(cmd); // Save command in history when successful
            server.emit('exit'); // Rather than process.exit, because that will just quit the program immediately.

        case 'set':
            if (words.length !== 3) {
                console.error('Usage: set <key> <value>');
            } else {
                setKeyValue(words[1], words[2]);
            }
            break;

        case 'get':
            if (words.length !== 2) {
                console.error('Usage: get <key>');
            } else {
                getKeyValue(words[1]);
            }
            break;

        default:
            // Wrapped in try/catch to prevent errors from stopping the REPL
            try {
                result = eval(cmd);

                // Print result of mathematical formulas, etc
                if (result !== undefined) {
                    console.info(result);
                }

                server.lines.push(cmd); // Save command in history when successful
            } catch (err) {
                // Single-line error messages like 'ReferenceError: ls is not defined'
                console.error(err.constructor.name + ': ' + err.message);
            }
    }

    return result;
}

// Autocomplete-with-tab setup
const customAutocomplete = function customAutocomplete(line, callback) { // non-async version crashes when used.
    const hits = commands.filter(c => c.indexOf(line) === 0);
    callback(null, [hits.length > 0 ? hits : commands, line]);
};

const loadHistory = function loadHistory(file) {
    let data;
    let line;
    let lastLine;

    data = ('' + fs.readFileSync(file))
        .split('\n')
        .filter(line => line.trim());

    debug('Entries: %s', data.length);

    // "Command History Compression"
    // Remove multiple instances in a row of the exact same command line while loading
    //  and re-write the history file with the new, slightly better, compressed version.
    data = data.filter(line => {
        if (lastLine === undefined) {
            lastLine = line;
            return true;
        } else if (line !== lastLine) {
            lastLine = line;
            return true;
        }

        lastLine = undefined;
        return false;
    })

    fs.writeFileSync(file, data.join('\n') + '\n');

    data.reverse().map(line => server.history.push(line));

    debug('Loaded command history: %s entries', data.length);

    // Otherwise the last debug call there leaves the user at a non-prompt which will change when arrow up/down is pressed.
    if (process.env.DEBUG) {
        process.stdout.write(server._prompt);
    }
};

function setKeyValue(key, value) {
    console.log(`Setting ${key} to ${value}`);
}

function getKeyValue(key) {
    console.log(`Getting value for ${key}`);
}

init();