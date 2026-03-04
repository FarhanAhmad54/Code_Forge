// Language registry for the code editor
// Each language has: id, name, monacoId, pistonRuntime, pistonVersion, extension, mode, defaultCode

export const LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    monacoId: 'javascript',
    extension: 'js',
    mode: 'browser',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    defaultCode: `// JavaScript - runs in your browser
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    monacoId: 'typescript',
    pistonRuntime: 'typescript',
    pistonVersion: '5.0.3',
    extension: 'ts',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
    defaultCode: `// TypeScript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

interface User {
  name: string;
  age: number;
}

const user: User = { name: "World", age: 25 };
console.log(greet(user.name));
console.log(\`Age: \${user.age}\`);
`
  },
  {
    id: 'python',
    name: 'Python',
    monacoId: 'python',
    pistonRuntime: 'python',
    pistonVersion: '3.10.0',
    extension: 'py',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    defaultCode: `# Python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for i, fib in enumerate(fibonacci(10)):
    print(f"fib({i}) = {fib}")
`
  },
  {
    id: 'c',
    name: 'C',
    monacoId: 'c',
    pistonRuntime: 'c',
    pistonVersion: '10.2.0',
    extension: 'c',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg',
    defaultCode: `// C
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        printf("fib(%d) = %d\\n", i, fibonacci(i));
    }
    return 0;
}
`
  },
  {
    id: 'cpp',
    name: 'C++',
    monacoId: 'cpp',
    pistonRuntime: 'c++',
    pistonVersion: '10.2.0',
    extension: 'cpp',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg',
    defaultCode: `// C++
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> fib = {0, 1};
    for (int i = 2; i < 10; i++) {
        fib.push_back(fib[i-1] + fib[i-2]);
    }
    for (int i = 0; i < 10; i++) {
        cout << "fib(" << i << ") = " << fib[i] << endl;
    }
    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java',
    monacoId: 'java',
    pistonRuntime: 'java',
    pistonVersion: '15.0.2',
    extension: 'java',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',
    defaultCode: `// Java
public class Main {
    static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            System.out.println("fib(" + i + ") = " + fibonacci(i));
        }
    }
}
`
  },
  {
    id: 'csharp',
    name: 'C#',
    monacoId: 'csharp',
    pistonRuntime: 'csharp.net',
    pistonVersion: '5.0.201',
    extension: 'cs',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg',
    defaultCode: `// C#
using System;

class Program {
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }

    static void Main() {
        for (int i = 0; i < 10; i++) {
            Console.WriteLine($"fib({i}) = {Fibonacci(i)}");
        }
    }
}
`
  },
  {
    id: 'go',
    name: 'Go',
    monacoId: 'go',
    pistonRuntime: 'go',
    pistonVersion: '1.16.2',
    extension: 'go',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original-wordmark.svg',
    defaultCode: `// Go
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    for i := 0; i < 10; i++ {
        fmt.Printf("fib(%d) = %d\\n", i, fibonacci(i))
    }
}
`
  },
  {
    id: 'rust',
    name: 'Rust',
    monacoId: 'rust',
    pistonRuntime: 'rust',
    pistonVersion: '1.68.2',
    extension: 'rs',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg',
    defaultCode: `// Rust
fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    for i in 0..10 {
        println!("fib({}) = {}", i, fibonacci(i));
    }
}
`
  },
  {
    id: 'ruby',
    name: 'Ruby',
    monacoId: 'ruby',
    pistonRuntime: 'ruby',
    pistonVersion: '3.0.1',
    extension: 'rb',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ruby/ruby-original.svg',
    defaultCode: `# Ruby
def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

10.times do |i|
  puts "fib(#{i}) = #{fibonacci(i)}"
end
`
  },
  {
    id: 'php',
    name: 'PHP',
    monacoId: 'php',
    pistonRuntime: 'php',
    pistonVersion: '8.2.3',
    extension: 'php',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg',
    defaultCode: `<?php
// PHP
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

for ($i = 0; $i < 10; $i++) {
    echo "fib($i) = " . fibonacci($i) . "\\n";
}
?>
`
  },
  {
    id: 'swift',
    name: 'Swift',
    monacoId: 'swift',
    pistonRuntime: 'swift',
    pistonVersion: '5.3.3',
    extension: 'swift',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swift/swift-original.svg',
    defaultCode: `// Swift
func fibonacci(_ n: Int) -> Int {
    if n <= 1 { return n }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

for i in 0..<10 {
    print("fib(\\(i)) = \\(fibonacci(i))")
}
`
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    monacoId: 'kotlin',
    pistonRuntime: 'kotlin',
    pistonVersion: '1.8.20',
    extension: 'kt',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kotlin/kotlin-original.svg',
    defaultCode: `// Kotlin
fun fibonacci(n: Int): Int = when {
    n <= 1 -> n
    else -> fibonacci(n - 1) + fibonacci(n - 2)
}

fun main() {
    for (i in 0 until 10) {
        println("fib($i) = \${fibonacci(i)}")
    }
}
`
  },
  {
    id: 'dart',
    name: 'Dart',
    monacoId: 'dart',
    pistonRuntime: 'dart',
    pistonVersion: '2.19.6',
    extension: 'dart',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg',
    defaultCode: `// Dart
int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

void main() {
  for (var i = 0; i < 10; i++) {
    print('fib($i) = \${fibonacci(i)}');
  }
}
`
  },
  {
    id: 'lua',
    name: 'Lua',
    monacoId: 'lua',
    pistonRuntime: 'lua',
    pistonVersion: '5.4.4',
    extension: 'lua',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/lua/lua-original.svg',
    defaultCode: `-- Lua
function fibonacci(n)
    if n <= 1 then return n end
    return fibonacci(n - 1) + fibonacci(n - 2)
end

for i = 0, 9 do
    print(string.format("fib(%d) = %d", i, fibonacci(i)))
end
`
  },
  {
    id: 'perl',
    name: 'Perl',
    monacoId: 'perl',
    pistonRuntime: 'perl',
    pistonVersion: '5.36.0',
    extension: 'pl',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/perl/perl-original.svg',
    defaultCode: `# Perl
use strict;
use warnings;

sub fibonacci {
    my ($n) = @_;
    return $n if $n <= 1;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

for my $i (0..9) {
    printf "fib(%d) = %d\\n", $i, fibonacci($i);
}
`
  },
  {
    id: 'r',
    name: 'R',
    monacoId: 'r',
    pistonRuntime: 'r',
    pistonVersion: '4.1.1',
    extension: 'r',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg',
    defaultCode: `# R
fibonacci <- function(n) {
  if (n <= 1) return(n)
  return(fibonacci(n - 1) + fibonacci(n - 2))
}

for (i in 0:9) {
  cat(sprintf("fib(%d) = %d\\n", i, fibonacci(i)))
}
`
  },
  {
    id: 'bash',
    name: 'Bash',
    monacoId: 'shell',
    pistonRuntime: 'bash',
    pistonVersion: '5.2.0',
    extension: 'sh',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg',
    defaultCode: `#!/bin/bash
# Bash
fibonacci() {
    local n=$1
    if [ $n -le 1 ]; then
        echo $n
    else
        local a=$(fibonacci $((n - 1)))
        local b=$(fibonacci $((n - 2)))
        echo $((a + b))
    fi
}

for i in $(seq 0 9); do
    echo "fib($i) = $(fibonacci $i)"
done
`
  },
  {
    id: 'html',
    name: 'HTML/CSS',
    monacoId: 'html',
    extension: 'html',
    mode: 'browser-html',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    defaultCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: rgba(255,255,255,0.95);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    h1 { color: #667eea; margin: 0 0 10px; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello World! 🌍</h1>
    <p>Edit this HTML and click Run to see changes.</p>
  </div>
</body>
</html>
`
  },
  {
    id: 'sql',
    name: 'SQL',
    monacoId: 'sql',
    pistonRuntime: 'sqlite3',
    pistonVersion: '3.36.0',
    extension: 'sql',
    mode: 'api',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg',
    defaultCode: `-- SQL (SQLite)
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER
);

INSERT INTO users (name, age) VALUES ('Alice', 30);
INSERT INTO users (name, age) VALUES ('Bob', 25);
INSERT INTO users (name, age) VALUES ('Charlie', 35);

SELECT * FROM users ORDER BY age;
SELECT name, age FROM users WHERE age > 28;
`
  }
];

export function getLanguageById(id) {
  return LANGUAGES.find(lang => lang.id === id);
}

export function getDefaultLanguage() {
  return LANGUAGES[0]; // JavaScript
}
