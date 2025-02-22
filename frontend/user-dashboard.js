document.addEventListener("DOMContentLoaded", () => {
    fetchUserProfile();

    document.getElementById("profileForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        updateUserProfile();
    });

    document.getElementById("updateProfileButton").addEventListener("click", () => {
        document.getElementById("profilePopup").style.display = "block";
    });

    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("profilePopup").style.display = "none";
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

async function fetchUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html"; // If token is not found, redirect to login
        return;
    }

    try {
        const response = await fetch("http://192.168.238.60:5000/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById("name").innerText = data.fullName;
            document.getElementById("email").innerText = data.email;
            document.getElementById("dropAddress").innerText = data.address;
            document.getElementById("requiredMeal").innerText = data.mealType;
            document.getElementById("startDate").innerText = data.startDate;
            document.getElementById("monthlySubscription").innerText = data.subscription;

            const inputs = document.querySelectorAll("#profileForm input, #profileForm select");
            inputs.forEach((input) => {
                if (data[input.name]) {
                    input.value = data[input.name];
                }
            });
        } else {
            console.error("Failed to fetch profile:", data.message);
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

async function updateUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html"; // If token is not found, redirect to login
        return;
    }

    const formData = new FormData(document.getElementById("profileForm"));

    try {
        const response = await fetch("http://192.168.238.60:5000/profile", {
            method: "POST",
            headers: {
                "Authorization": token
            },
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("Profile updated successfully!");
            fetchUserProfile();
            document.getElementById("profilePopup").style.display = "none";
        } else {
            alert("Error updating profile: " + result.message);
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
}

async function deleteProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html"; // If token is not found, redirect to login
        return;
    }

    if (!confirm("Are you sure you want to delete your profile?")) return;

    try {
        const response = await fetch("http://192.168.238.60:5000/profile", {
            method: "DELETE",
            headers: {
                "Authorization": token
            },
        });

        if (response.ok) {
            alert("Profile deleted successfully!");
            location.reload();
        } else {
            alert("Error deleting profile");
        }
    } catch (error) {
        console.error("Error deleting profile:", error);
    }
}

// Get the token from localStorage
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html"; // If token is not found, redirect to login
}

// Decode the token to get the admin details (using JWT decode or any library)
const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT token manually (for simplicity)
document.getElementById("adminName").innerText = decoded.name; // Admin's name
document.getElementById("adminEmail").innerText = decoded.email; // Admin's email

function logout() {
    localStorage.removeItem("token"); // Remove token on logout
    window.location.href = "login.html"; // Redirect to login page
}
