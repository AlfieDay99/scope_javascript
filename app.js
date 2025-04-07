// Global scope variables
const events = [];
let clickCount = 0;

// Debug state
let isDebugMode = false;
let currentStep = null;
let callStack = [];
let breakpoints = new Set();

// Debug display elements
const scopeChainDisplay = document.getElementById('scopeChainDisplay');
const thisContextDisplay = document.getElementById('thisContextDisplay');
const eventCounterDisplay = document.getElementById('eventCounterDisplay');
const consoleOutput = document.getElementById('consoleOutput');
const callStackDisplay = document.getElementById('callStackDisplay');
const toggleDebugModeBtn = document.getElementById('toggleDebugMode');
const stepControls = document.getElementById('stepControls');
const stepOverBtn = document.getElementById('stepOver');
const stepIntoBtn = document.getElementById('stepInto');
const continueBtn = document.getElementById('continue');
const currentLineDisplay = document.getElementById('currentLine');

// Debug control functions
function toggleDebugMode() {
    isDebugMode = !isDebugMode;
    document.body.classList.toggle('debug-mode', isDebugMode);
    stepControls.classList.toggle('hidden', !isDebugMode);
    toggleDebugModeBtn.textContent = isDebugMode ? 'Disable Debug Mode' : 'Enable Debug Mode';
    
    if (isDebugMode) {
        debugLog('Debug mode enabled', 'debug');
    } else {
        debugLog('Debug mode disabled', 'debug');
        currentStep = null;
        updateCallStackDisplay();
    }
}

function updateCallStackDisplay() {
    callStackDisplay.innerHTML = callStack
        .map((entry, index) => `
            <div class="call-stack-entry ${index === callStack.length - 1 ? 'active' : ''}">
                ${entry.functionName} (${entry.lineNumber})
            </div>
        `)
        .join('');
}

function addToCallStack(functionName, lineNumber) {
    callStack.push({ functionName, lineNumber });
    updateCallStackDisplay();
}

function removeFromCallStack() {
    callStack.pop();
    updateCallStackDisplay();
}

function debugStep(functionName, lineNumber) {
    if (!isDebugMode) return Promise.resolve();
    
    currentStep = { functionName, lineNumber };
    addToCallStack(functionName, lineNumber);
    currentLineDisplay.textContent = `Current: ${functionName} (line ${lineNumber})`;
    
    return new Promise(resolve => {
        const handleStep = () => {
            stepOverBtn.removeEventListener('click', handleStep);
            stepIntoBtn.removeEventListener('click', handleStep);
            continueBtn.removeEventListener('click', handleStep);
            resolve();
        };
        
        stepOverBtn.addEventListener('click', handleStep);
        stepIntoBtn.addEventListener('click', handleStep);
        continueBtn.addEventListener('click', handleStep);
    });
}

// Event Listeners for debug controls
toggleDebugModeBtn.addEventListener('click', toggleDebugMode);

// Custom console logging
function debugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    consoleOutput.appendChild(logEntry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    console.log(message);
}

// Event constructor function
function Event(name, type) {
    debugStep('Event constructor', 1);
    this.name = name;
    this.type = type;
    this.timestamp = new Date();
    this.id = Date.now();
    debugLog(`Created new event: ${name} (${type})`, 'event');
}

// Method to add event to the log
Event.prototype.log = async function() {
    await debugStep('Event.log', 1);
    events.push(this);
    await debugStep('Event.log', 2);
    updateLogDisplay();
    await debugStep('Event.log', 3);
    debugLog(`Logged event: ${this.name}`, 'success');
};

// Method to demonstrate different 'this' behaviors
Event.prototype.getDetails = async function() {
    await debugStep('Event.getDetails', 1);
    debugLog(`Getting details for event: ${this.name}`, 'info');
    return function() {
        return `Event: ${this.name}, Type: ${this.type}`;
    }.bind(this);
};

// Nested scope demonstration
async function createScopeDemo() {
    await debugStep('createScopeDemo', 1);
    const outerVar = 'Outer Scope';
    debugLog('Created outer scope', 'scope');
    
    async function middleScope() {
        await debugStep('middleScope', 1);
        const middleVar = 'Middle Scope';
        debugLog('Created middle scope', 'scope');
        
        async function innerScope() {
            await debugStep('innerScope', 1);
            const innerVar = 'Inner Scope';
            debugLog('Created inner scope', 'scope');
            
            const scopeObject = {
                name: 'Scope Object',
                getScopeChain: async function() {
                    await debugStep('getScopeChain', 1);
                    const chain = `${outerVar} -> ${middleVar} -> ${innerVar}`;
                    updateScopeChainDisplay(chain);
                    return chain;
                },
                getThisContext: async function() {
                    await debugStep('getThisContext', 1);
                    const that = this;
                    debugLog('Captured this context in closure', 'this');
                    
                    return {
                        regularFunction: async function() {
                            await debugStep('regularFunction', 1);
                            const thisContext = {
                                type: 'regular',
                                value: this,
                                description: 'Regular function - this refers to the object the method is called on'
                            };
                            debugLog('Regular function this:', 'this');
                            return thisContext;
                        },
                        arrowFunction: async () => {
                            await debugStep('arrowFunction', 1);
                            const thisContext = {
                                type: 'arrow',
                                value: this,
                                description: 'Arrow function - this is inherited from the surrounding scope'
                            };
                            debugLog('Arrow function this:', 'this');
                            return thisContext;
                        },
                        boundFunction: async function() {
                            await debugStep('boundFunction', 1);
                            const thisContext = {
                                type: 'bound',
                                value: this,
                                description: 'Bound function - this is fixed to the specified context'
                            };
                            debugLog('Bound function this:', 'this');
                            return thisContext;
                        }.bind(that)
                    };
                }
            };
            
            return scopeObject;
        }
        
        return await innerScope();
    }
    
    return await middleScope();
}

// Update scope chain display
function updateScopeChainDisplay(chain) {
    scopeChainDisplay.innerHTML = chain.split(' -> ')
        .map(scope => `<div class="scope-level scope-${scope.toLowerCase().split(' ')[0]}">${scope}</div>`)
        .join('');
}

// Update this context display
function updateThisContextDisplay(context, type) {
    let contextStr;
    if (context && typeof context === 'object') {
        contextStr = JSON.stringify({
            type: context.type,
            value: context.value,
            description: context.description
        }, null, 2);
    } else {
        contextStr = JSON.stringify(context, null, 2);
    }
    thisContextDisplay.innerHTML = `<div class="this-context this-${type}">${type}: ${contextStr}</div>`;
}

// Different ways to handle this
function demonstrateThisHandling() {
    const obj = {
        name: 'Test Object',
        regularMethod: async function() {
            await debugStep('regularMethod', 1);
            debugLog('Regular method called', 'this');
            return this.name;
        },
        arrowMethod: async () => {
            await debugStep('arrowMethod', 1);
            debugLog('Arrow method called', 'this');
            return this.name;
        }
    };
    
    return {
        callDemo: async function(context) {
            await debugStep('callDemo', 1);
            debugLog('Using call()', 'this');
            return obj.regularMethod.call(context);
        },
        applyDemo: async function(context) {
            await debugStep('applyDemo', 1);
            debugLog('Using apply()', 'this');
            return obj.regularMethod.apply(context);
        },
        bindDemo: async function(context) {
            await debugStep('bindDemo', 1);
            debugLog('Using bind()', 'this');
            const boundMethod = obj.regularMethod.bind(context);
            return boundMethod();
        }
    };
}

// Closure-based event counter
function createEventCounter(limit) {
    let count = 0;
    debugLog(`Created event counter with limit: ${limit}`, 'counter');
    
    return {
        increment: async function() {
            await debugStep('increment', 1);
            if (count < limit) {
                count++;
                await debugStep('increment', 2);
                updateEventCounterDisplay(count, limit);
                debugLog(`Incremented counter: ${count}/${limit}`, 'counter');
                return count;
            }
            await debugStep('increment', 3);
            debugLog('Counter limit reached', 'warning');
            return 'Limit reached';
        },
        getCount: function() {
            return count;
        }
    };
}

// Update event counter display
function updateEventCounterDisplay(count, limit) {
    eventCounterDisplay.innerHTML = `
        <div class="counter-display">
            Events: ${count}/${limit}
            <div class="progress-bar">
                <div class="progress" style="width: ${(count/limit) * 100}%"></div>
            </div>
        </div>
    `;
}

// Create instances
let eventCounter;
let scopeDemo;
let thisDemo;

// Initialize instances
async function initializeInstances() {
    eventCounter = createEventCounter(5);
    scopeDemo = await createScopeDemo();
    thisDemo = demonstrateThisHandling();
    debugLog('All instances initialized', 'info');
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeInstances);

// DOM Elements
const addEventBtn = document.getElementById('addEventBtn');
const trackClicksBtn = document.getElementById('trackClicksBtn');
const simulateDelayBtn = document.getElementById('simulateDelayBtn');
const eventFilter = document.getElementById('eventFilter');
const logContainer = document.getElementById('logContainer');

// Event Listeners
addEventBtn.addEventListener('click', async function() {
    if (!scopeDemo) {
        debugLog('Instances not yet initialized. Please wait...', 'warning');
        return;
    }

    if (isDebugMode) {
        await debugStep('addEventBtn click', 1);
    }
    debugLog('Add Event button clicked', 'action');
    const count = await eventCounter.increment();
    if (count === 'Limit reached') {
        alert('Event limit reached!');
        return;
    }
    
    const event = new Event('Custom Event', 'custom');
    await event.log();
    
    const getDetails = await event.getDetails();
    debugLog('Event details: ' + getDetails(), 'info');
    
    const chain = await scopeDemo.getScopeChain();
    debugLog('Scope chain: ' + chain, 'scope');
    
    const thisContexts = await scopeDemo.getThisContext();
    updateThisContextDisplay(await thisContexts.regularFunction(), 'regular');
    updateThisContextDisplay(await thisContexts.arrowFunction(), 'arrow');
    updateThisContextDisplay(await thisContexts.boundFunction(), 'bound');
});

trackClicksBtn.addEventListener('click', async () => {
    if (!scopeDemo) {
        debugLog('Instances not yet initialized. Please wait...', 'warning');
        return;
    }

    if (isDebugMode) {
        await debugStep('trackClicksBtn click', 1);
    }
    debugLog('Track Clicks button clicked', 'action');
    const count = await eventCounter.increment();
    if (count === 'Limit reached') {
        alert('Event limit reached!');
        return;
    }
    
    clickCount++;
    const event = new Event(`Click ${clickCount}`, 'click');
    await event.log();
    
    const testContext = { name: 'Test Context' };
    debugLog('Call demo: ' + await thisDemo.callDemo(testContext), 'this');
    debugLog('Apply demo: ' + await thisDemo.applyDemo(testContext), 'this');
    debugLog('Bind demo: ' + await thisDemo.bindDemo(testContext), 'this');
});

simulateDelayBtn.addEventListener('click', async function() {
    if (!scopeDemo) {
        debugLog('Instances not yet initialized. Please wait...', 'warning');
        return;
    }

    if (isDebugMode) {
        await debugStep('simulateDelayBtn click', 1);
    }
    debugLog('Simulate Delay button clicked', 'action');
    const count = await eventCounter.increment();
    if (count === 'Limit reached') {
        alert('Event limit reached!');
        return;
    }
    
    const button = this;
    button.disabled = true;
    debugLog('Button disabled, waiting 3 seconds...', 'timer');
    
    setTimeout(async () => {
        if (isDebugMode) {
            await debugStep('setTimeout callback', 1);
        }
        const event = new Event('Delayed Event', 'timer');
        await event.log();
        button.disabled = false;
        debugLog('Delay completed, button re-enabled', 'timer');
    }, 3000);
});

// Filter events
eventFilter.addEventListener('change', function() {
    debugLog(`Filter changed to: ${this.value}`, 'filter');
    updateLogDisplay();
});

// Helper function to update the log display
function updateLogDisplay() {
    const filterType = eventFilter.value;
    const filteredEvents = filterType === 'all' 
        ? events 
        : events.filter(event => event.type === filterType);
    
    logContainer.innerHTML = filteredEvents
        .map(event => `
            <div class="log-entry">
                <strong>${event.name}</strong> (${event.type})
                <br>
                <small>${event.timestamp.toLocaleString()}</small>
                <br>
                <small>Events remaining: ${5 - eventCounter.getCount()}</small>
            </div>
        `)
        .join('');
} 