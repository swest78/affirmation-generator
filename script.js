// --- THE "IS THIS THING ON?" TEST ---
// If you see this message when you reload the page, the script is working!
alert('SUCCESS: The script.js file is connected!');
// ------------------------------------


// This is a best practice. It waits for all the HTML content to be loaded
// before trying to run any JavaScript on it.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get references to our important HTML elements ---
    const submitButton = document.getElementById('submit-button');
    const feelingInput = document.getElementById('feeling-input');
    const affirmationContainer = document.getElementById('affirmation-container');

    // --- 2. Set up the "Event Listener" ---
    // If the alert worked but the button still does nothing, the problem is here.
    // It means the script can't find 'submit-button'.
    submitButton.addEventListener('click', getAffirmations);


    // --- 3. The main function that does all the work ---
    async function getAffirmations() {
        
        // --- !!! YOUR N8N WEBHOOK URL SHOULD BE HERE !!! ---
        const webhookUrl = 'http://localhost:5678/webhook/e01ed9a7-8f13-4659-807b-7bd3b2697795'; // Make sure your URL is still here!

        const userFeeling = feelingInput.value;

        if (!userFeeling.trim()) {
            affirmationContainer.innerHTML = '<p class="error-message">Please share a little about how you feel first.</p>';
            return;
        }

        submitButton.textContent = 'Thinking...';
        submitButton.disabled = true;
        affirmationContainer.innerHTML = '';

        const dataToSend = {
            feeling: userFeeling
        };

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error('Something went wrong on the server.');
            }

            const affirmationsText = await response.text();

// Clear any previous results
affirmationContainer.innerHTML = '';

// Split the text from the AI into an array of lines
const affirmationsArray = affirmationsText.trim().split('\n');

// Go through each line in the array...
affirmationsArray.forEach(line => {
    // ...but only if the line isn't empty...
    if (line.trim() !== '') {
        // ...and doesn't contain the word "Affirmations:"
        if (line.toLowerCase().includes('affirmations:')) {
            // If it's the title line, just skip it
            return; 
        }

        // Create a new <p> element for this affirmation
        const p = document.createElement('p');
        // Remove any numbering like "1. " from the start of the line
        p.textContent = line.replace(/^\d+\.\s*/, ''); 
        // Add a CSS class for styling
        p.className = 'affirmation-item'; 
        // Add the new paragraph to our container
        affirmationContainer.appendChild(p);
    }
});

        } catch (error) {
            console.error('Error fetching affirmations:', error);
            affirmationContainer.innerHTML = `<p class="error-message">Sorry, I couldn't connect. Please check if n8n is running and try again.</p>`;
        
        } finally {
            submitButton.textContent = 'Receive Affirmations';
            submitButton.disabled = false;
        }
    }

    // Add styles for our error messages
    const style = document.createElement('style');
    style.innerHTML = `
        .error-message {
            color: #c0392b;
            background-color: #f9e3e1;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
});