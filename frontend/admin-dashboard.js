// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
    fetchAdminProfile();
    fetchAllUserProfiles();
    updateDashboardStats();
    initializeEventListeners();
});

// Event Listeners
function initializeEventListeners() {
    // User form submission
    document.getElementById("userForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const userId = document.getElementById("userId").value;
        if (userId) {
            updateUserProfile();
        } else {
            createUser();
        }
    });

    // Close modal when clicking outside
    window.onclick = function (event) {
        const modal = document.getElementById('userModal');
        if (event.target === modal) {
            closeUserModal();
        }
    }
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
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Dashboard Functions
async function fetchAdminProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        document.getElementById("adminName").innerText = decoded.name || 'Admin';
        document.getElementById("adminEmail").innerText = decoded.email || 'admin@example.com';
    } catch (error) {
        console.error("Error decoding token:", error);
    }
}

async function updateDashboardStats() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/admin/stats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById("totalUsers").innerText = stats.totalUsers || 0;
            document.getElementById("activeUsers").innerText = stats.activeUsers || 0;
            document.getElementById("todaysMeals").innerText = stats.todaysMeals || 0;
            document.getElementById("pendingActions").innerText = stats.pendingActions || 0;
        }
    } catch (error) {
        console.error("Error fetching stats:", error);
        // Set default values if API fails
        document.getElementById("totalUsers").innerText = "0";
        document.getElementById("activeUsers").innerText = "0";
        document.getElementById("todaysMeals").innerText = "0";
        document.getElementById("pendingActions").innerText = "0";
    }
}


function refreshDashboard() {
    updateDashboardStats();
    updateActivityList();
}

function updateActivityList() {
    const activities = [
        { icon: 'fa-user-plus', text: 'New user registered: John Doe', time: '2 minutes ago' },
        { icon: 'fa-edit', text: 'User profile updated: Jane Smith', time: '15 minutes ago' },
        { icon: 'fa-utensils', text: 'Meal plan changed: Mike Johnson', time: '1 hour ago' },
        { icon: 'fa-check-circle', text: 'Payment received: Sarah Williams', time: '2 hours ago' }
    ];

    const activityList = document.getElementById('activityList');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <i class="fas ${activity.icon}"></i>
            <div class="activity-details">
                <p>${activity.text}</p>
                <span>${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// User Management Functions
async function fetchAllUserProfiles() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/admin/profiles", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
        });

        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
        } else {
            console.error("Failed to fetch user profiles");
            displayUsers([]); // Display empty table
        }
    } catch (error) {
        console.error("Error fetching user profiles:", error);
        displayUsers([]); // Display empty table
    }
}

function displayUsers(users) {
    const userTable = document.getElementById("userTable");

    if (users.length === 0) {
        userTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 10px;"></i>
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    userTable.innerHTML = users.map(user => `
        <tr>
            <td>${user.fullName || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.mealType || 'N/A'}</td>
            <td><span class="status-badge status-${user.status || 'active'}">${user.status || 'Active'}</span></td>
            <td>${formatDate(user.startDate)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editUser('${user._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchUsers(searchTerm) {
    const rows = document.querySelectorAll('#userTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function showCreateUserForm() {
    document.getElementById('modalTitle').innerText = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').style.display = 'block';
}

function editUser(userId) {
    // Fetch user data and populate form
    const token = localStorage.getItem("token");

    fetch(`https://my-backend-cedd.onrender.com/admin/profile/${userId}`, {
        headers: {
            "Authorization": token
        }
    })
        .then(response => response.json())
        .then(user => {
            document.getElementById('modalTitle').innerText = 'Update User';
            document.getElementById('userId').value = user._id;
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('fatherName').value = user.fatherName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
            document.getElementById('mealType').value = user.mealType || 'Regular';
            document.getElementById('startDate').value = formatDateForInput(user.startDate);
            document.getElementById('userModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching user:', error);
            alert('Error loading user data');
        });
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
}

async function createUser() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const formData = new FormData(document.getElementById("userForm"));

    // No need to manually add password - backend will handle it

    try {
        const response = await fetch("https://my-backend-cedd.onrender.com/admin/create-user", {
            method: "POST",
            headers: {
                "Authorization": token
            },
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('User created successfully!', 'success');
            closeUserModal();
            fetchAllUserProfiles();
        } else {
            showNotification('Error creating user: ' + result.error, 'error');
        }
    } catch (error) {
        console.error("Error creating user:", error);
        showNotification('Error creating user', 'error');
    }
}

async function updateUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const userId = document.getElementById("userId").value;
    const formData = new FormData(document.getElementById("userForm"));

    // Show loading state
    const submitBtn = document.querySelector('#userForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`https://my-backend-cedd.onrender.com/admin/profile/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": token
            },
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Profile updated successfully!', 'success');
            closeUserModal();
            fetchAllUserProfiles();
        } else {
            showNotification('Error updating profile: ' + result.message, 'error');
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        showNotification('Error updating profile', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`https://my-backend-cedd.onrender.com/admin/profile/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": token
            },
        });

        if (response.ok) {
            showNotification('User deleted successfully!', 'success');
            fetchAllUserProfiles();
        } else {
            showNotification('Error deleting user', 'error');
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        showNotification('Error deleting user', 'error');
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

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        color: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Logout Function
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}

// Meal Management Functions (placeholders)
function showAddMealForm() {
    alert("Add Meal Form - To be implemented");
}

// Initialize charts (if using Chart.js)
function initializeCharts() {
    // Add chart initialization code here if needed
}

// Call initialization
initializeCharts();