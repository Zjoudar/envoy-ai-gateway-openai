// Global variables
let currentSpecialty = '';

async function generateStrategy() {
    const specialtyInput = document.getElementById('specialtyInput');
    const specialty = specialtyInput.value.trim();
    
    if (!specialty) {
        alert('Please enter a specialty');
        return;
    }
    
    currentSpecialty = specialty;
    showLoading(true);
    
    try {
        const response = await fetch('/generate_strategy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ specialty: specialty })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayStrategy(data.strategy);
        } else {
            throw new Error(data.error || 'Failed to generate strategy');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating strategy: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function generateLeads() {
    if (!currentSpecialty) {
        alert('Please generate a strategy first');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/generate_leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ specialty: currentSpecialty })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayLeads(data);
        } else {
            throw new Error(data.error || 'Failed to generate leads');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating leads: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function validateEmail() {
    const emailInput = document.getElementById('emailValidateInput');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    try {
        const response = await fetch('/validate_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        const resultDiv = document.getElementById('validationResult');
        if (data.is_valid) {
            resultDiv.innerHTML = `<span class="success">✓ Valid email format</span>`;
        } else {
            resultDiv.innerHTML = `<span class="error">✗ Invalid email format</span>`;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error validating email: ' + error.message);
    }
}

async function generateEmailVariations() {
    const firstName = document.getElementById('firstNameInput').value.trim();
    const lastName = document.getElementById('lastNameInput').value.trim();
    const company = document.getElementById('companyInput').value.trim();
    
    if (!firstName || !lastName || !company) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch('/generate_email_variations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                company: company
            })
        });
        
        const data = await response.json();
        
        if (data.variations) {
            displayEmailVariations(data);
        } else {
            throw new Error(data.error || 'Failed to generate variations');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating email variations: ' + error.message);
    }
}

function displayStrategy(strategy) {
    const strategySection = document.getElementById('strategySection');
    const strategyContent = document.getElementById('strategyContent');
    
    strategyContent.textContent = strategy;
    strategySection.classList.remove('hidden');
    
    // Scroll to strategy section
    strategySection.scrollIntoView({ behavior: 'smooth' });
}

function displayLeads(data) {
    const leadsSection = document.getElementById('leadsSection');
    const leadsContent = document.getElementById('leadsContent');
    const emailsList = document.getElementById('emailsList');
    
    // Display leads data
    leadsContent.innerHTML = '';
    
    if (data.mock_profiles && data.mock_profiles.length > 0) {
        data.mock_profiles.forEach(profile => {
            const profileCard = document.createElement('div');
            profileCard.className = 'profile-card';
            profileCard.innerHTML = `
                <h4>${profile.name}</h4>
                <p><strong>Title:</strong> ${profile.title}</p>
                <p><strong>Company:</strong> ${profile.company}</p>
                <p><strong>Location:</strong> ${profile.location}</p>
            `;
            leadsContent.appendChild(profileCard);
        });
    }
    
    // Display AI-generated leads data
    const aiData = document.createElement('div');
    aiData.innerHTML = `<h4>AI Analysis:</h4><pre>${data.leads_data}</pre>`;
    leadsContent.appendChild(aiData);
    
    // Display extracted emails
    emailsList.innerHTML = '';
    if (data.extracted_emails && data.extracted_emails.length > 0) {
        data.extracted_emails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.className = 'email-item email-valid';
            emailItem.innerHTML = `
                <span>${email}</span>
                <button onclick="copyToClipboard('${email}')">Copy</button>
            `;
            emailsList.appendChild(emailItem);
        });
    } else {
        emailsList.innerHTML = '<p>No emails extracted from the analysis.</p>';
    }
    
    leadsSection.classList.remove('hidden');
    leadsSection.scrollIntoView({ behavior: 'smooth' });
}

function displayEmailVariations(data) {
    const variationsResult = document.getElementById('variationsResult');
    
    let html = `<h4>Email variations for ${data.name} at ${data.company}:</h4>`;
    
    data.variations.forEach(variation => {
        html += `
            <div class="variation-item">
                ${variation}
                <button onclick="copyToClipboard('${variation}')" style="margin-left: 10px; padding: 5px 10px; font-size: 12px;">Copy</button>
            </div>
        `;
    });
    
    variationsResult.innerHTML = html;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show some feedback
        alert('Copied to clipboard: ' + text);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// Add event listeners for Enter key
document.getElementById('specialtyInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateStrategy();
    }
});

document.getElementById('emailValidateInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        validateEmail();
    }
});