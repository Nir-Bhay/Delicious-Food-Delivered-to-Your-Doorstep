// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
    initializeEventListeners();
    updateCurrentDate();
});

// Initialize Dashboard
async function initializeDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    await fetchUserProfile();
    await fetchDashboardData();
    checkBalanceAlert();
    loadTodaysMeal();
}

// Event Listeners
function initializeEventListeners() {
    // Profile form submission
    document.getElementById("profileForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        await updateUserProfile();
    });

    // Payment form submission
    document.getElementById("paymentForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitPayment();
    });

    // Set minimum date for meal off options
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('mealOffFrom').min = today;
    document.getElementById('mealOffTo').min = today;
}

// Update current date
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = today;
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load section specific data
    switch(sectionId) {
        case 'history':
            loadHistory();
            break;
        case 'mealStatus':
            loadMealCalendar();
            break;
        case 'payments':
            loadPaymentHistory();
            break;
    }
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Fetch User Profile
async function fetchUserProfile() {
    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
        });

        if (response.ok) {
            const data = await response.json();
            updateProfileDisplay(data);
        } else {
            showNotification('Failed to fetch profile', 'error');
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        showNotification('Error loading profile', 'error');
    }
}

// Update Profile Display
// Update Profile Display
function updateProfileDisplay(data) {
    // Dashboard
    document.getElementById("userName").textContent = data.fullName || 'User';
    document.getElementById("currentMealPlan").textContent = data.mealType || 'Regular';

    // Profile Section
    document.getElementById("profileName").textContent = data.fullName || 'N/A';
    document.getElementById("profileEmail").textContent = data.email || 'N/A';
    document.getElementById("profilePhone").textContent = data.phone || 'N/A';
    document.getElementById("profileAddress").textContent = data.address || 'N/A';
    document.getElementById("profileMealPlan").textContent = data.mealType || 'N/A';
    document.getElementById("profileStartDate").textContent = formatDate(data.startDate);
    document.getElementById("memberSince").textContent = new Date(data.createdAt).getFullYear();

    // Update form values
    document.getElementById("editFullName").value = data.fullName || '';
    document.getElementById("editFatherName").value = data.fatherName || '';
    document.getElementById("editPhone").value = data.phone || '';
    document.getElementById("editEmail").value = data.email || '';
    document.getElementById("editAddress").value = data.address || '';

    // Update daily cost based on meal type
    const mealPrices = {
        'Premium': 150,
        'Executive': 120,
        'Half Executive': 80,
        'Regular': 60
    };
    document.getElementById("dailyCost").textContent = mealPrices[data.mealType] || 0;
}

// Fetch Dashboard Data
async function fetchDashboardData() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/user/dashboard", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values
        updateDashboardStats({});
    }
}

// Update Dashboard Stats
function updateDashboardStats(data) {
    document.getElementById("currentBalance").textContent = data.balance || 0;
    document.getElementById("daysRemaining").textContent = calculateDaysRemaining(data.balance, data.dailyCost);
    document.getElementById("mealsThisMonth").textContent = data.mealsThisMonth || 0;
    document.getElementById("totalMeals").textContent = data.totalMeals || 0;
    document.getElementById("activeDays").textContent = data.activeDays || 0;
    document.getElementById("totalSpent").textContent = data.totalSpent || 0;
    document.getElementById("avgPerDay").textContent = data.avgPerDay || 0;
}

// Calculate Days Remaining
function calculateDaysRemaining(balance, dailyCost) {
    if (!balance || !dailyCost) return 0;
    return Math.floor(balance / dailyCost);
}

// Check Balance Alert
function checkBalanceAlert() {
    const balance = parseFloat(document.getElementById("currentBalance").textContent);
    const dailyCost = parseFloat(document.getElementById("dailyCost").textContent);
    const daysRemaining = calculateDaysRemaining(balance, dailyCost);

    if (daysRemaining <= 5 && daysRemaining > 0) {
        document.getElementById("alertDays").textContent = daysRemaining;
        document.getElementById("balanceAlert").style.display = 'flex';
    }
}

// Load Today's Meal
function loadTodaysMeal() {
    const mealPlan = document.getElementById("currentMealPlan").textContent;
    const mealDetails = {
        'Premium': ['4 Chapati', 'Rice (Unlimited)', 'Dal', '2 Vegetables', 'Salad', 'Sweet Dish', 'Pickle & Papad'],
        'Executive': ['3 Chapati', 'Rice', 'Dal', '1 Vegetable', 'Salad', 'Pickle'],
        'Half Executive': ['2 Chapati', 'Rice', 'Dal', '1 Vegetable', 'Pickle'],
        'Regular': ['2 Chapati', 'Rice (Limited)', 'Dal', '1 Vegetable']
    };

    const details = mealDetails[mealPlan] || mealDetails['Regular'];
    document.getElementById("todayMealDetails").innerHTML = `
        <ul style="list-style: none; padding: 0;">
            ${details.map(item => `<li style="padding: 5px 0;"><i class="fas fa-check-circle" style="color: var(--success-color); margin-right: 10px;"></i>${item}</li>`).join('')}
        </ul>
    `;
}

// Meal Status Management
function toggleMealStatus() {
    const toggle = document.getElementById("mealToggle");
    const status = toggle.checked ? 'ON' : 'OFF';
    document.getElementById("toggleStatus").textContent = status;

    if (!toggle.checked) {
        document.getElementById("mealOffOptions").style.display = 'block';
    } else {
        document.getElementById("mealOffOptions").style.display = 'none';
        // Turn meal back on
        updateMealStatus('on');
    }
}

async function setMealOff(days) {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days - 1);

    await updateMealStatus('off', {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        days: days
    });

    showNotification(`Meal turned off for ${days} day(s)`, 'success');
}

function showCustomDatePicker() {
    document.getElementById("customDateModal").style.display = 'block';
}

function closeCustomDate() {
    document.getElementById("customDateModal").style.display = 'none';
}

async function confirmCustomDate() {
    const fromDate = document.getElementById("mealOffFrom").value;
    const toDate = document.getElementById("mealOffTo").value;

    if (!fromDate || !toDate) {
        showNotification('Please select both dates', 'warning');
        return;
    }

    const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1;

    await updateMealStatus('off', {
        fromDate: fromDate,
        toDate: toDate,
        days: days
    });

    closeCustomDate();
    showNotification(`Meal turned off from ${formatDate(fromDate)} to ${formatDate(toDate)}`, 'success');
}

async function updateMealStatus(status, details = {}) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/user/meal-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ status, ...details })
        });

        if (response.ok) {
            if (status === 'on') {
                document.getElementById("mealStatusDisplay").textContent = 'Active';
            } else {
                document.getElementById("mealStatusDisplay").textContent = details.days > 3 ? 'TNA' : 'Meal Off';
            }
            loadMealCalendar();
        }
    } catch (error) {
        console.error("Error updating meal status:", error);
        showNotification('Error updating meal status', 'error');
    }
}

// Load Meal Calendar
function loadMealCalendar() {
    // This would typically fetch from API
    const calendar = document.getElementById("mealCalendar");
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Create calendar grid
    calendar.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();

    // Add empty cells
    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    // Add days
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        if (day === today.getDate()) {
            dayDiv.classList.add('active');
        }
        dayDiv.innerHTML = `
            <span class="date">${day}</span>
            <span class="status">Active</span>
        `;
        calendar.appendChild(dayDiv);
    }
}

// Payment Functions
function selectRecharge(amount) {
    document.getElementById("paymentAmount").value = amount;
    document.getElementById("customAmount").value = '';
}

async function submitPayment() {
    const token = localStorage.getItem("token");

    const paymentData = {
        name: document.getElementById("paymentName").value,
        amount: document.getElementById("paymentAmount").value || document.getElementById("customAmount").value,
        upiId: document.getElementById("upiId").value,
        transactionId: document.getElementById("transactionId").value
    };

    if (!paymentData.amount || !paymentData.transactionId) {
        showNotification('Please fill all required fields', 'warning');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/user/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(paymentData)
        });

        if (response.ok) {
            showNotification('Payment submitted successfully! Waiting for admin approval.', 'success');
            document.getElementById("paymentForm").reset();
            loadPaymentHistory();
        } else {
            showNotification('Error submitting payment', 'error');
        }
    } catch (error) {
        console.error("Error submitting payment:", error);
        showNotification('Error submitting payment', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Load Payment History
async function loadPaymentHistory() {
    const transactions = [
        { id: 1, amount: 1000, date: '2024-01-15', status: 'approved', transactionId: 'TXN123456' },
        { id: 2, amount: 500, date: '2024-01-10', status: 'pending', transactionId: 'TXN123457' },
        { id: 3, amount: 2000, date: '2024-01-05', status: 'approved', transactionId: 'TXN123458' }
    ];

    const transactionList = document.getElementById("transactionList");
    transactionList.innerHTML = transactions.map(txn => `
        <div class="transaction-item">
            <div class="transaction-info">
                <h4>Payment ${txn.status === 'approved' ? 'Received' : 'Pending'}</h4>
                <p>Transaction ID: ${txn.transactionId}</p>
                <p>${formatDate(txn.date)}</p>
            </div>
            <div class="transaction-amount">
                <p class="amount">₹${txn.amount}</p>
                <p class="status">${txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}</p>
            </div>
        </div>
    `).join('');
}

// Change Meal Plan
async function changeMealPlan(plan) {
    if (!confirm(`Are you sure you want to change to ${plan} plan?`)) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/user/meal-plan", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ mealType: plan })
        });

        if (response.ok) {
            showNotification(`Meal plan changed to ${plan}`, 'success');
            fetchUserProfile();
            document.querySelectorAll('.meal-plan-card').forEach(card => {
                card.classList.remove('current');
            });
        } else {
            showNotification('Error changing meal plan', 'error');
        }
    } catch (error) {
        console.error("Error changing meal plan:", error);
        showNotification('Error changing meal plan', 'error');
    }
}

// Show Menu Day
function showMenuDay(day) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Sample menu data
    const menuData = {
        monday: ['Rajma', 'Rice', 'Chapati', 'Salad'],
        tuesday: ['Chole', 'Rice', 'Chapati', 'Raita'],
        wednesday: ['Dal Makhani', 'Rice', 'Chapati', 'Pickle'],
        thursday: ['Kadhi', 'Rice', 'Chapati', 'Papad'],
        friday: ['Mix Veg', 'Rice', 'Chapati', 'Salad'],
        saturday: ['Paneer', 'Rice', 'Chapati', 'Sweet'],
        sunday: ['Special Thali', 'Rice', 'Chapati', 'Dessert']
    };

    const menuContent = document.getElementById("menuContent");
    menuContent.innerHTML = `
        <h4 style="margin-bottom: 15px;">${day.charAt(0).toUpperCase() + day.slice(1)}'s Menu</h4>
        <ul style="list-style: none; padding: 0;">
            ${menuData[day].map(item => `<li style="padding: 8px 0;"><i class="fas fa-utensils" style="color: var(--primary-color); margin-right: 10px;"></i>${item}</li>`).join('')}
        </ul>
    `;
}

// Load History
// Load History
function loadHistory() {
    // This would typically fetch from API
    // For now, using sample data
    const historyData = [
        { type: 'payment', title: 'Payment Received', description: '₹1000 added to your balance', date: new Date(), status: 'success' },
        { type: 'meal', title: 'Meal Delivered', description: 'Executive meal delivered successfully', date: new Date(), status: 'primary' },
        { type: 'status', title: 'Meal Status Changed', description: 'Meal turned OFF for tomorrow', date: new Date(Date.now() - 86400000), status: 'warning' },
        { type: 'payment', title: 'Payment Pending', description: '₹500 payment awaiting confirmation', date: new Date(Date.now() - 172800000), status: 'warning' },
        { type: 'meal', title: 'Plan Changed', description: 'Changed from Regular to Executive plan', date: new Date(Date.now() - 259200000), status: 'primary' }
    ];

    displayHistoryTimeline(historyData);
}

function displayHistoryTimeline(data) {
    const timeline = document.querySelector('.history-timeline');
    timeline.innerHTML = data.map(item => `
        <div class="timeline-item">
            <div class="timeline-marker ${item.status}"></div>
            <div class="timeline-content">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <span class="timeline-date">${formatDateTime(item.date)}</span>
            </div>
        </div>
    `).join('');
}

function filterHistory(filterType) {
    // Filter history based on type
    loadHistory(); // Reload with filter
}

function exportHistory() {
    showNotification('Exporting history...', 'success');
    // Implementation for exporting history to CSV/PDF
}

// Profile Functions
function showEditProfile() {
    document.getElementById("editProfileModal").style.display = 'block';
}

function closeEditProfile() {
    document.getElementById("editProfileModal").style.display = 'none';
}

async function updateUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const formData = new FormData(document.getElementById("profileForm"));

    // Show loading state
    const submitBtn = document.querySelector('#profileForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/profile", {
            method: "POST",
            headers: {
                "Authorization": token
            },
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            showNotification("Profile updated successfully!", 'success');
            fetchUserProfile();
            closeEditProfile();
        } else {
            showNotification("Error updating profile: " + result.message, 'error');
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        showNotification("Error updating profile", 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Logout Function
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}

// Auto-refresh dashboard data
setInterval(() => {
    if (document.getElementById('dashboard').style.display !== 'none') {
        fetchDashboardData();
    }
}, 60000); // Refresh every minute

// Handle window clicks for modal closing
window.onclick = function (event) {
    const editModal = document.getElementById('editProfileModal');
    const dateModal = document.getElementById('customDateModal');

    if (event.target === editModal) {
        closeEditProfile();
    } else if (event.target === dateModal) {
        closeCustomDate();
    }
}

// Initialize menu tabs
document.addEventListener('DOMContentLoaded', function () {
    // Show Monday's menu by default
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        firstTab.click();
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + S to save profile
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && document.getElementById('editProfileModal').style.display === 'block') {
        e.preventDefault();
        document.getElementById('profileForm').dispatchEvent(new Event('submit'));
    }

    // Escape to close modals
    if (e.key === 'Escape') {
        closeEditProfile();
        closeCustomDate();
    }
});

// Handle network status
window.addEventListener('online', function () {
    showNotification('Connection restored', 'success');
    initializeDashboard();
});

window.addEventListener('offline', function () {
    showNotification('No internet connection', 'error');
});

// Service Worker Registration (for offline support)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
        console.log('ServiceWorker registration successful');
    }).catch(function (err) {
        console.log('ServiceWorker registration failed: ', err);
    });
}

// Additional Features

// Real-time balance update simulation
function simulateBalanceUpdate() {
    const currentBalance = parseFloat(document.getElementById("currentBalance").textContent);
    const dailyCost = parseFloat(document.getElementById("dailyCost").textContent);

    // Simulate daily deduction at midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const msUntilMidnight = midnight - now;

    setTimeout(() => {
        const newBalance = currentBalance - dailyCost;
        document.getElementById("currentBalance").textContent = newBalance;
        document.getElementById("daysRemaining").textContent = calculateDaysRemaining(newBalance, dailyCost);
        checkBalanceAlert();

        // Schedule next update
        simulateBalanceUpdate();
    }, msUntilMidnight);
}

// Initialize balance simulation
simulateBalanceUpdate();

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        calculateDaysRemaining,
        showNotification
    };
}