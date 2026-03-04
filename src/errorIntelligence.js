// Error Intelligence Module for CodeForge
// Pattern-matches common errors and provides human-readable explanations

const ERROR_PATTERNS = {
    python: [
        { pattern: /IndentationError/i, title: 'Indentation Error', explanation: 'Python uses indentation to define code blocks. Make sure your code is properly indented with consistent spaces or tabs.', fix: 'Use 4 spaces for each indentation level. Don\'t mix tabs and spaces.', docs: 'https://docs.python.org/3/reference/lexical_analysis.html#indentation' },
        { pattern: /SyntaxError:\s*invalid syntax/i, title: 'Syntax Error', explanation: 'There\'s a typo or missing symbol in your code. Common causes: missing colons, unmatched parentheses, or invalid operators.', fix: 'Check for missing colons after if/for/while/def, and ensure all brackets are matched.', docs: 'https://docs.python.org/3/tutorial/errors.html' },
        { pattern: /NameError:\s*name\s*'(\w+)'\s*is not defined/i, title: 'Undefined Variable', explanation: 'You\'re trying to use a variable or function that hasn\'t been defined yet.', fix: 'Make sure you\'ve declared the variable before using it. Check for typos in variable names.', docs: 'https://docs.python.org/3/library/exceptions.html#NameError' },
        { pattern: /TypeError:\s*unsupported operand/i, title: 'Type Mismatch', explanation: 'You\'re trying to perform an operation on incompatible types (e.g., adding a string and an integer).', fix: 'Convert values to the same type using int(), str(), or float() before the operation.', docs: 'https://docs.python.org/3/library/exceptions.html#TypeError' },
        { pattern: /IndexError:\s*list index out of range/i, title: 'Index Out of Range', explanation: 'You\'re trying to access a list element at an index that doesn\'t exist.', fix: 'Make sure your index is between 0 and len(list)-1. Use len() to check the list size.', docs: 'https://docs.python.org/3/library/exceptions.html#IndexError' },
        { pattern: /KeyError/i, title: 'Key Error', explanation: 'You\'re trying to access a dictionary with a key that doesn\'t exist.', fix: 'Use dict.get(key, default) or check if key exists with "if key in dict:".', docs: 'https://docs.python.org/3/library/exceptions.html#KeyError' },
        { pattern: /ZeroDivisionError/i, title: 'Division by Zero', explanation: 'You\'re trying to divide a number by zero, which is mathematically undefined.', fix: 'Add a check: if divisor != 0 before dividing.', docs: 'https://docs.python.org/3/library/exceptions.html#ZeroDivisionError' },
        { pattern: /ImportError|ModuleNotFoundError/i, title: 'Import Error', explanation: 'Python can\'t find the module you\'re trying to import.', fix: 'Check the module name for typos. In this environment, only standard library modules are available.', docs: 'https://docs.python.org/3/library/exceptions.html#ImportError' },
        { pattern: /RecursionError/i, title: 'Maximum Recursion Depth', explanation: 'Your recursive function calls itself too many times without reaching a base case.', fix: 'Ensure your recursive function has a proper base case that stops recursion.', docs: 'https://docs.python.org/3/library/exceptions.html#RecursionError' },
    ],
    javascript: [
        { pattern: /ReferenceError:\s*(\w+)\s*is not defined/i, title: 'Undefined Reference', explanation: 'You\'re using a variable or function that hasn\'t been declared.', fix: 'Declare the variable with let, const, or var before using it. Check for typos.', docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_defined' },
        { pattern: /TypeError:\s*Cannot read propert/i, title: 'Cannot Read Property', explanation: 'You\'re trying to access a property on null or undefined.', fix: 'Use optional chaining (?.) or check if the value exists before accessing properties.', docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_property' },
        { pattern: /SyntaxError:\s*Unexpected token/i, title: 'Unexpected Token', explanation: 'JavaScript found a character or keyword it didn\'t expect at this position.', fix: 'Check for missing brackets, commas, semicolons, or mismatched quotes.', docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_token' },
        { pattern: /TypeError:\s*(\w+)\s*is not a function/i, title: 'Not a Function', explanation: 'You\'re trying to call something that isn\'t a function.', fix: 'Make sure the value is a function before calling it. Check for typos in function names.', docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_function' },
        { pattern: /RangeError:\s*Maximum call stack/i, title: 'Stack Overflow', explanation: 'Your code has infinite recursion — a function keeps calling itself without stopping.', fix: 'Add a base case to your recursive function to stop the recursion.', docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion' },
        { pattern: /TypeError:\s*Assignment to constant/i, title: 'Constant Reassignment', explanation: 'You\'re trying to change the value of a variable declared with const.', fix: 'Use let instead of const if you need to reassign the variable.', docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_const_assignment' },
    ],
    java: [
        { pattern: /NullPointerException/i, title: 'Null Pointer', explanation: 'You\'re trying to use an object reference that is null.', fix: 'Initialize objects before using them. Add null checks: if (obj != null).', docs: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/' },
        { pattern: /ArrayIndexOutOfBoundsException/i, title: 'Array Index Out of Bounds', explanation: 'You\'re accessing an array with an index that\'s too large or negative.', fix: 'Use array.length to check bounds before accessing elements.', docs: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html' },
        { pattern: /ClassNotFoundException/i, title: 'Class Not Found', explanation: 'Java can\'t find the class you\'re referencing.', fix: 'Check class names for typos. Ensure the class is in your main file.', docs: 'https://docs.oracle.com/javase/tutorial/reflect/class/' },
        { pattern: /cannot find symbol/i, title: 'Cannot Find Symbol', explanation: 'Java can\'t find a variable, method, or class that you\'re referencing.', fix: 'Check for typos, missing imports, or undeclared variables.', docs: 'https://docs.oracle.com/javase/tutorial/java/javaOO/' },
    ],
    cpp: [
        { pattern: /segmentation fault/i, title: 'Segmentation Fault', explanation: 'Your program tried to access memory it\'s not allowed to. Common causes: null pointers, array overflow, or freed memory.', fix: 'Check array bounds, initialize pointers, and avoid accessing freed memory.', docs: 'https://en.cppreference.com/w/cpp/language/memory_model' },
        { pattern: /undefined reference/i, title: 'Undefined Reference', explanation: 'The linker can\'t find the implementation of a function you\'re calling.', fix: 'Make sure all functions are defined and all libraries are linked.', docs: 'https://en.cppreference.com/w/cpp/language/definition' },
        { pattern: /error:\s*expected\s*';'/i, title: 'Missing Semicolon', explanation: 'C++ requires semicolons at the end of statements.', fix: 'Add a semicolon (;) at the end of the indicated line.', docs: 'https://en.cppreference.com/w/cpp/language/statements' },
    ],
    c: [
        { pattern: /segmentation fault/i, title: 'Segmentation Fault', explanation: 'Your program tried to access invalid memory. Common in C with pointer errors.', fix: 'Check pointer initialization, array bounds, and memory allocation/deallocation.', docs: 'https://en.cppreference.com/w/c/language/memory_model' },
        { pattern: /implicit declaration of function/i, title: 'Missing Function Declaration', explanation: 'You\'re calling a function without declaring it first.', fix: 'Add a function prototype before main() or include the correct header file.', docs: 'https://en.cppreference.com/w/c/language/function_declaration' },
    ],
    rust: [
        { pattern: /borrow checker|cannot borrow/i, title: 'Borrow Checker Error', explanation: 'Rust\'s ownership system prevents data races. You can\'t have multiple mutable references to the same data.', fix: 'Use .clone() to create a copy, or restructure your code to use references properly.', docs: 'https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html' },
        { pattern: /mismatched types/i, title: 'Type Mismatch', explanation: 'The types in your expression don\'t match what Rust expects.', fix: 'Use type conversion functions like .into(), as, or From/Into traits.', docs: 'https://doc.rust-lang.org/book/ch03-02-data-types.html' },
    ],
    go: [
        { pattern: /undefined:/i, title: 'Undefined', explanation: 'Go can\'t find the variable, function, or package you\'re referencing.', fix: 'Declare all variables before use. Import required packages.', docs: 'https://go.dev/ref/spec#Declarations_and_scope' },
        { pattern: /unused variable/i, title: 'Unused Variable', explanation: 'Go doesn\'t allow unused variables — it\'s a compile error, not a warning.', fix: 'Use the variable or prefix it with _ to ignore.', docs: 'https://go.dev/ref/spec#Blank_identifier' },
    ],
};

// Generic fallback patterns (apply to all languages)
const GENERIC_PATTERNS = [
    { pattern: /timeout|time limit exceeded/i, title: 'Timeout', explanation: 'Your code took too long to execute. This usually means an infinite loop or very slow algorithm.', fix: 'Check for infinite loops. Consider using a more efficient algorithm.', docs: null },
    { pattern: /out of memory|memory limit/i, title: 'Out of Memory', explanation: 'Your code used too much memory. This can happen with very large data structures or memory leaks.', fix: 'Reduce data structure sizes. Avoid storing unnecessary data in memory.', docs: null },
    { pattern: /stack overflow/i, title: 'Stack Overflow', explanation: 'Too many nested function calls, usually from infinite recursion.', fix: 'Ensure recursive functions have a proper base case. Consider using iteration instead.', docs: null },
    { pattern: /division by zero|divide by zero/i, title: 'Division by Zero', explanation: 'Your code attempted to divide by zero.', fix: 'Add a check before division to ensure the divisor is not zero.', docs: null },
];

export function analyzeError(errorText, languageId) {
    if (!errorText) return null;

    // Try language-specific patterns first
    const langPatterns = ERROR_PATTERNS[languageId] || [];
    for (const rule of langPatterns) {
        if (rule.pattern.test(errorText)) {
            return {
                title: rule.title,
                explanation: rule.explanation,
                fix: rule.fix,
                docs: rule.docs,
                language: languageId,
            };
        }
    }

    // Try generic patterns
    for (const rule of GENERIC_PATTERNS) {
        if (rule.pattern.test(errorText)) {
            return {
                title: rule.title,
                explanation: rule.explanation,
                fix: rule.fix,
                docs: rule.docs,
                language: languageId,
            };
        }
    }

    return null;
}

export function formatErrorIntelligence(analysis) {
    if (!analysis) return '';

    let html = `<div class="error-intelligence">`;
    html += `<div class="ei-header"><span class="ei-icon">💡</span><span class="ei-title">${analysis.title}</span></div>`;
    html += `<div class="ei-body">`;
    html += `<p class="ei-explanation">${analysis.explanation}</p>`;
    html += `<div class="ei-fix"><strong>Fix:</strong> ${analysis.fix}</div>`;
    if (analysis.docs) {
        html += `<a class="ei-docs" href="${analysis.docs}" target="_blank" rel="noopener">📚 Read Documentation →</a>`;
    }
    html += `</div></div>`;

    return html;
}
