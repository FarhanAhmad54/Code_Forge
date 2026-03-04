// Code Explanation Mode for CodeForge
// Provides plain-English explanations of code constructs

const CONSTRUCT_PATTERNS = [
    // Loops
    { pattern: /for\s*\(.*?;.*?;.*?\)\s*\{/g, type: 'for-loop', explain: (m) => `**For Loop** — Repeats a block of code a specific number of times. The three parts are: initialization, condition, and increment.` },
    { pattern: /for\s+(\w+)\s+in\s+/g, type: 'for-in', explain: () => `**For-In Loop** — Iterates over each item in a collection (list, range, dictionary).` },
    { pattern: /for\s*\(\s*(?:let|const|var)\s+\w+\s+of\s+/g, type: 'for-of', explain: () => `**For-Of Loop** — Iterates over values of an iterable (array, string, Map, Set).` },
    { pattern: /while\s*\(.+?\)\s*\{/g, type: 'while-loop', explain: () => `**While Loop** — Repeats as long as the condition is true. Make sure the condition eventually becomes false!` },
    { pattern: /\.forEach\s*\(/g, type: 'forEach', explain: () => `**forEach** — Calls a function for each element in an array. Does not return a new array (use .map() for that).` },
    { pattern: /\.map\s*\(/g, type: 'map', explain: () => `**map()** — Creates a new array by transforming each element. Returns a new array of the same length.` },
    { pattern: /\.filter\s*\(/g, type: 'filter', explain: () => `**filter()** — Creates a new array with elements that pass a test. Returns a subset of the original array.` },
    { pattern: /\.reduce\s*\(/g, type: 'reduce', explain: () => `**reduce()** — Reduces an array to a single value by applying a function to each element with an accumulator.` },

    // Functions
    { pattern: /function\s+(\w+)\s*\(/g, type: 'function', explain: (m) => `**Function Declaration** — Defines a reusable function named "${m[1]}". It can be called later with arguments.` },
    { pattern: /const\s+(\w+)\s*=\s*\(.*?\)\s*=>/g, type: 'arrow-fn', explain: (m) => `**Arrow Function** — A concise way to write functions. "${m[1]}" is an arrow function assigned to a constant.` },
    { pattern: /def\s+(\w+)\s*\(/g, type: 'py-function', explain: (m) => `**Python Function** — Defines a function named "${m[1]}". Use return to send back a value.` },
    { pattern: /async\s+function/g, type: 'async', explain: () => `**Async Function** — Can use "await" to pause execution until a Promise resolves. Returns a Promise.` },

    // Conditionals
    { pattern: /if\s*\(.+?\)\s*\{/g, type: 'if', explain: () => `**If Statement** — Executes the block only if the condition is true.` },
    { pattern: /else\s+if\s*\(/g, type: 'else-if', explain: () => `**Else If** — Checks an additional condition if the previous if/else-if was false.` },
    { pattern: /\?\s*.+?\s*:\s*/g, type: 'ternary', explain: () => `**Ternary Operator** — A shorthand if-else: condition ? valueIfTrue : valueIfFalse.` },
    { pattern: /switch\s*\(.+?\)\s*\{/g, type: 'switch', explain: () => `**Switch Statement** — Compares a value against multiple cases. More readable than chained if-else for many conditions.` },

    // Data structures
    { pattern: /class\s+(\w+)/g, type: 'class', explain: (m) => `**Class "${m[1]}"** — A blueprint for creating objects. Contains methods and properties. Use "new ${m[1]}()" to create instances.` },
    { pattern: /new\s+Map\s*\(/g, type: 'map-ds', explain: () => `**Map** — A key-value data structure. Unlike objects, Map keys can be any type and maintain insertion order.` },
    { pattern: /new\s+Set\s*\(/g, type: 'set-ds', explain: () => `**Set** — A collection of unique values. Automatically removes duplicates. Great for deduplication.` },
    { pattern: /new\s+Promise\s*\(/g, type: 'promise', explain: () => `**Promise** — Represents a future value. Resolve for success, reject for failure. Use .then() or await.` },

    // Error handling
    { pattern: /try\s*\{/g, type: 'try-catch', explain: () => `**Try-Catch** — Wraps code that might throw errors. If an error occurs in try, the catch block handles it gracefully.` },
    { pattern: /throw\s+new\s+/g, type: 'throw', explain: () => `**Throw** — Intentionally creates an error. Useful for signaling invalid states to the calling code.` },

    // Recursion
    { pattern: /return\s+\w+\s*\(.*?\)\s*[+\-\*\/]/g, type: 'recursion', explain: () => `**Recursion** — This function calls itself. Each call should move toward a base case to avoid infinite recursion.` },
];

const COMPLEXITY_HINTS = {
    'for-loop': { time: 'O(n)', space: 'O(1)', note: 'Nested loops would be O(n²)' },
    'while-loop': { time: 'O(n)', space: 'O(1)', note: 'Depends on how the condition changes' },
    'forEach': { time: 'O(n)', space: 'O(1)', note: 'Linear iteration' },
    'map': { time: 'O(n)', space: 'O(n)', note: 'Creates a new array of same size' },
    'filter': { time: 'O(n)', space: 'O(n)', note: 'Creates a new subset array' },
    'reduce': { time: 'O(n)', space: 'O(1)', note: 'Single accumulator pass' },
    'recursion': { time: 'O(2ⁿ) or O(n)', space: 'O(n) stack', note: 'Depends on branching factor' },
};

export function explainCode(code) {
    const explanations = [];

    for (const construct of CONSTRUCT_PATTERNS) {
        construct.pattern.lastIndex = 0;
        let match;
        while ((match = construct.pattern.exec(code)) !== null) {
            const lineNumber = code.substring(0, match.index).split('\n').length;
            explanations.push({
                line: lineNumber,
                type: construct.type,
                text: construct.explain(match),
                complexity: COMPLEXITY_HINTS[construct.type] || null,
                matchedCode: match[0].substring(0, 60),
            });
        }
    }

    // Sort by line number
    explanations.sort((a, b) => a.line - b.line);

    return explanations;
}

export function formatExplanations(explanations) {
    if (explanations.length === 0) {
        return '<div class="explain-empty">Select some code to explain, or your code is too simple to need explanation! 🎉</div>';
    }

    let html = '<div class="explain-results">';
    for (const exp of explanations) {
        html += `<div class="explain-item">`;
        html += `<div class="explain-line">Line ${exp.line}</div>`;
        html += `<div class="explain-text">${exp.text}</div>`;
        if (exp.complexity) {
            html += `<div class="explain-complexity">`;
            html += `<span class="complexity-badge time">⏱ ${exp.complexity.time}</span>`;
            html += `<span class="complexity-badge space">💾 ${exp.complexity.space}</span>`;
            if (exp.complexity.note) {
                html += `<span class="complexity-note">${exp.complexity.note}</span>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    }
    html += '</div>';

    return html;
}

export function explainSelection(selectedCode) {
    return explainCode(selectedCode);
}
