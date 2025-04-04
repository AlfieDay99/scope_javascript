// Global scope variables
const events = [];
let clickCount = 0;

// Event constructor function
function Event(name, type) {
    // 'this' refers to the new object being created
    this.name = name;
    this.type = type;
    this.timestamp = new Date();
    this.id = Date.now(); // Simple unique ID
}

// Method to add event to the log
Event.prototype.log = function() {
    events.push(this);
    updateLogDisplay();
};

// Method to demonstrate different 'this' behaviors
Event.prototype.getDetails = function() {
    // Regular function - 'this' refers to the event object
    return function() {
        return `Event: ${this.name}, Type: ${this.type}`;
    }.bind(this); // Using bind to fix 'this'
};

// Closure-based event counter
function createEventCounter(limit) {
    let count = 0;
    return {
        increment: function() {
            if (count < limit) {
                count++;
                return count;
            }
            return 'Limit reached';
        },
        getCount: function() {
            return count;
        }
    };
}

// Create a counter with a limit of 5 events
const eventCounter = createEventCounter(5);

// DOM Elements
const addEventBtn = document.getElementById('addEventBtn');
const trackClicksBtn = document.getElementById('trackClicksBtn');
const simulateDelayBtn = document.getElementById('simulateDelayBtn');
const eventFilter = document.getElementById('eventFilter');
const logContainer = document.getElementById('logContainer');

// Event Listeners
addEventBtn.addEventListener('click', function() {
    const count = eventCounter.increment();
    if (count === 'Limit reached') {
        alert('Event limit reached!');
        return;
    }
    
    const event = new Event('Custom Event', 'custom');
    event.log();
    
    // Demonstrate different 'this' behaviors
    const getDetails = event.getDetails();
    console.log('Event details:', getDetails());
});

trackClicksBtn.addEventListener('click', () => {
    const count = eventCounter.increment();
    if (count === 'Limit reached') {
        alert('Event limit reached!');
        return;
    }
    
    clickCount++;
    const event = new Event(`Click ${clickCount}`, 'click');
    event.log();
});

simulateDelayBtn.addEventListener('click', function() {
    const count = eventCounter.increment();
    if (count === 'Limit reached') {
        alert('Event limit reached!');
        return;
    }
    
    const button = this;
    button.disabled = true;
    
    setTimeout(() => {
        const event = new Event('Delayed Event', 'timer');
        event.log();
        button.disabled = false;
    }, 3000);
});

// Filter events
eventFilter.addEventListener('change', function() {
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