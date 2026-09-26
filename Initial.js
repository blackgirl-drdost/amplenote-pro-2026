{\rtf1\ansi\ansicpg1251\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // task_manager.js\
// A simple command-line task manager with persistence to a JSON file.\
\
const fs = require('fs');\
const path = require('path');\
const readline = require('readline');\
\
const DATA_FILE = path.join(__dirname, 'tasks.json');\
\
// ---------- Storage layer ----------\
\
function loadTasks() \{\
    if (!fs.existsSync(DATA_FILE)) \{\
        return [];\
    \}\
    try \{\
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');\
        const parsed = JSON.parse(raw);\
        return Array.isArray(parsed) ? parsed : [];\
    \} catch (err) \{\
        console.error('Failed to read tasks file:', err.message);\
        return [];\
    \}\
\}\
\
function saveTasks(tasks) \{\
    try \{\
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');\
    \} catch (err) \{\
        console.error('Failed to save tasks:', err.message);\
    \}\
\}\
\
// ---------- Business logic ----------\
\
function addTask(tasks, title) \{\
    const trimmed = (title || '').trim();\
    if (!trimmed) \{\
        console.log('Task title cannot be empty.');\
        return;\
    \}\
    const task = \{\
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,\
        title: trimmed,\
        done: false,\
        createdAt: new Date().toISOString()\
    \};\
    tasks.push(task);\
    saveTasks(tasks);\
    console.log(`Added task #$\{task.id\}: "$\{task.title\}"`);\
\}\
\
function listTasks(tasks) \{\
    if (tasks.length === 0) \{\
        console.log('No tasks yet. Add one with: add <title>');\
        return;\
    \}\
    console.log('\\nYour tasks:');\
    console.log('---------------------------------------------');\
    for (const task of tasks) \{\
        const status = task.done ? '[x]' : '[ ]';\
        console.log(`$\{status\} #$\{task.id\}  $\{task.title\}`);\
    \}\
    console.log('---------------------------------------------\\n');\
\}\
\
function completeTask(tasks, id) \{\
    const task = tasks.find(t => t.id === id);\
    if (!task) \{\
        console.log(`Task #$\{id\} not found.`);\
        return;\
    \}\
    task.done = true;\
    saveTasks(tasks);\
    console.log(`Task #$\{id\} marked as done.`);\
\}\
\
function removeTask(tasks, id) \{\
    const index = tasks.findIndex(t => t.id === id);\
    if (index === -1) \{\
        console.log(`Task #$\{id\} not found.`);\
        return;\
    \}\
    const [removed] = tasks.splice(index, 1);\
    saveTasks(tasks);\
    console.log(`Removed task #$\{removed.id\}: "$\{removed.title\}"`);\
\}\
\
function clearCompleted(tasks) \{\
    const before = tasks.length;\
    const remaining = tasks.filter(t => !t.done);\
    tasks.length = 0;\
    tasks.push(...remaining);\
    saveTasks(tasks);\
    console.log(`Removed $\{before - remaining.length\} completed task(s).`);\
\}\
\
// ---------- CLI ----------\
\
function printHelp() \{\
    console.log(`\
Available commands:\
  add <title>        Add a new task\
  list               Show all tasks\
  done <id>          Mark a task as completed\
  remove <id>        Delete a task\
  clear              Remove all completed tasks\
  help               Show this help\
  exit               Quit the program\
`);\
\}\
\
function handleCommand(tasks, line) \{\
    const parts = line.trim().split(/\\s+/);\
    const command = (parts[0] || '').toLowerCase();\
    const args = parts.slice(1);\
\
    switch (command) \{\
        case 'add':\
            addTask(tasks, args.join(' '));\
            break;\
        case 'list':\
            listTasks(tasks);\
            break;\
        case 'done': \{\
            const id = parseInt(args[0], 10);\
            if (isNaN(id)) \{\
                console.log('Please provide a valid task id.');\
            \} else \{\
                completeTask(tasks, id);\
            \}\
            break;\
        \}\
        case 'remove': \{\
            const id = parseInt(args[0], 10);\
            if (isNaN(id)) \{\
                console.log('Please provide a valid task id.');\
            \} else \{\
                removeTask(tasks, id);\
            \}\
            break;\
        \}\
        case 'clear':\
            clearCompleted(tasks);\
            break;\
        case 'help':\
            printHelp();\
            break;\
        case 'exit':\
        case 'quit':\
            return false;\
        case '':\
            break;\
        default:\
            console.log(`Unknown command: "$\{command\}". Type "help" for options.`);\
    \}\
    return true;\
\}\
\
function main() \{\
    const tasks = loadTasks();\
    const rl = readline.createInterface(\{\
        input: process.stdin,\
        output: process.stdout,\
        prompt: 'task> '\
    \});\
\
    console.log('Simple Task Manager');\
    console.log('Type "help" to see available commands.\\n');\
\
    rl.prompt();\
\
    rl.on('line', (line) => \{\
        const shouldContinue = handleCommand(tasks, line);\
        if (!shouldContinue) \{\
            rl.close();\
        \} else \{\
            rl.prompt();\
        \}\
    \});\
\
    rl.on('close', () => \{\
        console.log('\\nGoodbye!');\
        process.exit(0);\
    \});\
\}\
\
main();}