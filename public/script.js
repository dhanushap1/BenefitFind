/* =====================================================
   BENEFITFIND - GOVERNMENT BENEFITS FINDER
   Existing features + Eligibility Matching
===================================================== */


/* =====================================================
   GOVERNMENT BENEFITS DATA

   IMPORTANT:
   These eligibility rules are DEMONSTRATION RULES.
   Verify actual government scheme requirements before
   using them to make real eligibility decisions.
===================================================== */

const schemes = [
    {
        id: 1,
        name: "Post-Matric Scholarship",
        category: "Education",
        benefit: "Up to ₹25,000 per year",
        deadline: "28 August 2026",
        description:
            "Financial assistance for eligible students pursuing higher education.",
        url: "https://scholarships.gov.in",

        eligibility: {
            maxAge: 30,
            maxIncome: 250000,
            education: ["Undergraduate", "Postgraduate"],
            categories: ["SC", "ST", "OBC"],
            occupations: ["Student"]
        }
    },

    {
        id: 2,
        name: "Student Financial Assistance",
        category: "Education",
        benefit: "Financial support for education",
        deadline: "18 September 2026",
        description:
            "Support for eligible students to continue their education.",
        url: "https://scholarships.gov.in",

        eligibility: {
            maxAge: 30,
            maxIncome: 500000,
            education: [
                "School",
                "Diploma",
                "Undergraduate",
                "Postgraduate"
            ],
            occupations: ["Student"]
        }
    },

    {
        id: 3,
        name: "State Housing Assistance",
        category: "Housing",
        benefit: "Housing assistance",
        deadline: "05 September 2026",
        description:
            "Financial assistance for eligible households requiring housing support.",
        url: "https://www.india.gov.in",

        eligibility: {
            states: ["Kerala"],
            maxIncome: 500000
        }
    },

    {
        id: 4,
        name: "Employment Support Scheme",
        category: "Employment",
        benefit: "Training and financial assistance",
        deadline: "22 September 2026",
        description:
            "Employment-oriented training and support for eligible applicants.",
        url: "https://www.india.gov.in",

        eligibility: {
            occupations: ["Student", "Self-employed"],
            maxAge: 35
        }
    },

    {
        id: 5,
        name: "Healthcare Assistance",
        category: "Healthcare",
        benefit: "Medical assistance",
        deadline: "30 September 2026",
        description:
            "Support for eligible citizens requiring healthcare assistance.",
        url: "https://www.india.gov.in",

        eligibility: {
            maxIncome: 500000
        }
    },

    {
        id: 6,
        name: "Farmer Support Programme",
        category: "Agriculture",
        benefit: "Agricultural financial support",
        deadline: "15 October 2026",
        description:
            "Financial assistance and support for eligible farmers.",
        url: "https://www.india.gov.in",

        eligibility: {
            occupations: ["Farmer"]
        }
    }
];


/* =====================================================
   VARIABLES
===================================================== */

let savedSchemes = (
    JSON.parse(localStorage.getItem("savedSchemes")) || [1, 3]
).map(id => String(id));

let currentCategory = "All";
let currentScheme = null;
let currentProfile = null;
function getSchemeId(scheme) {
    return String(scheme?._id ?? scheme?.id ?? "");
}

function normalizeValue(value) {
    return String(value ?? "").trim().toLowerCase();
}

function matchesAllowedValue(profileValue, allowedValues) {
    if (!Array.isArray(allowedValues)) return true;

    return allowedValues.some(value =>
        normalizeValue(value) === normalizeValue(profileValue)
    );
}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loginForm")
        .addEventListener("submit", login);

    document.getElementById("registerForm")
        .addEventListener("submit", register);

    updateUser();
    renderRecommended();
    renderExplore();
    renderSaved();
    renderDeadlines();
    renderAdminTable();
});


/* =====================================================
   LOGIN / REGISTER
===================================================== */

function showLogin() {
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
}

function showRegister() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("registerPage").classList.remove("hidden");
}


/* LOGIN */

async function login(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Login failed.");
            return;
        }

        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("loggedIn", "true");

        await startApp();

    } catch (error) {
        console.error("Login error:", error);
        showToast("Unable to connect to the server.");
    }
}


/* REGISTRATION */

async function register(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        showToast("Please fill in all fields.");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch("/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Registration failed.");
            return;
        }

        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("loggedIn", "true");

        await startApp();

        showToast(data.message || "Account created successfully.");

    } catch (error) {
        console.error("Registration error:", error);
        showToast("Unable to connect to the server. Please try again.");
    }
}


/* =====================================================
   START APP / LOGOUT
===================================================== */

async function startApp() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    await loadProfileForMatching();

    updateUser();
    renderRecommended();
    renderExplore();
    renderSaved();
    renderDeadlines();
    await loadAdminSchemes();

    showPage("dashboard");
    showToast("Welcome to BenefitFind");
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    currentProfile = null;

    document.getElementById("app").classList.add("hidden");

    showLogin();

    showToast("You have been logged out.");
}


/* =====================================================
   USER INFORMATION
===================================================== */

function updateUser() {
    const name = localStorage.getItem("userName") || "Ananya";
    const firstName = name.split(" ")[0];

    const initials = name
        .split(" ")
        .filter(word => word.length > 0)
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    document.getElementById("welcomeName").textContent = firstName;
    document.getElementById("userNameTop").textContent = firstName;
    document.getElementById("userInitials").textContent = initials;
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileAvatar").textContent = initials;
    document.getElementById("pName").value = name;
    document.getElementById("savedCount").textContent = savedSchemes.length;
}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-item[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageId);
    });

    if (pageId === "dashboard") {
        renderRecommended();
    }

    if (pageId === "profile") {
        loadProfile();
    }

    if (pageId === "explore") {
        renderExplore();
    }

    if (pageId === "saved") {
        renderSaved();
    }

    if (pageId === "deadlines") {
        renderDeadlines();
    }

    if (pageId === "admin") {
        loadAdminSchemes();
    }
}


/* =====================================================
   LOAD PROFILE FOR ELIGIBILITY MATCHING
===================================================== */

async function loadProfileForMatching() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        currentProfile = null;
        return;
    }

    try {
        const response = await fetch(
            `/api/users/profile/${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load profile.");
        }

        currentProfile = data.user;

        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);

    } catch (error) {
        console.error("Profile matching error:", error);
        currentProfile = null;
    }
}


/* =====================================================
   ELIGIBILITY MATCHING LOGIC
===================================================== */

function getIncomeValue(income) {
    // Income is stored as a number in MongoDB.
    if (typeof income === "number" && Number.isFinite(income)) {
        return income;
    }

    // Also support income dropdown labels if needed.
    const incomeRanges = {
        "Below ₹2.5 lakh": 250000,
        "₹2.5 - ₹5 lakh": 500000,
        "₹5 - ₹10 lakh": 1000000,
        "Above ₹10 lakh": 1000001
    };

    return incomeRanges[income] ?? null;
}


function checkEligibility(scheme, profile) {
    const rules = scheme.eligibility || {};
    const reasons = [];

    if (!profile) {
        return {
            eligible: false,
            status: "Complete your profile",
            reasons: ["Please log in and complete your profile."]
        };
    }

    if (
        typeof rules !== "object" ||
        Array.isArray(rules) ||
        Object.keys(rules).length === 0
    ) {
        return {
            eligible: false,
            status: "Rules not configured",
            reasons: ["Eligibility rules have not been configured."]
        };
    }

    if (rules.occupations &&
        !matchesAllowedValue(profile.occupation, rules.occupations)) {
        reasons.push("Your occupation does not match.");
    }

    if (rules.states &&
        !matchesAllowedValue(profile.state, rules.states)) {
        reasons.push("Your state does not match.");
    }

    if (rules.categories &&
        !matchesAllowedValue(profile.category, rules.categories)) {
        reasons.push("Your category does not match.");
    }

    if (rules.education &&
        !matchesAllowedValue(profile.education, rules.education)) {
        reasons.push("Your education level does not match.");
    }

    const age = Number(profile.age);

    if (rules.minAge !== undefined &&
        (!profile.age || age < Number(rules.minAge))) {
        reasons.push("Your age is below the minimum requirement.");
    }

    if (rules.maxAge !== undefined &&
        (!profile.age || age > Number(rules.maxAge))) {
        reasons.push("Your age is above the maximum requirement.");
    }

    const income = Number(profile.income);

    if (rules.maxIncome !== undefined &&
        profile.income !== "" &&
        profile.income != null &&
        Number.isFinite(income) &&
        income > Number(rules.maxIncome)) {
        reasons.push("Your income exceeds the allowed limit.");
    }

    if (reasons.length > 0) {
        return {
            eligible: false,
            status: "Not Eligible",
            reasons
        };
    }

    return {
        eligible: true,
        status: "Matches configured rules",
        reasons: ["Your profile matches the configured rules."]
    };
}
/* =====================================================
   RECOMMENDED SCHEMES
===================================================== */

function renderRecommended() {
    const container = document.getElementById("recommendedList");

    if (!container) return;

    if (!currentProfile) {
        container.innerHTML = `
            <div class="scheme-card">
                <h3>Complete your profile</h3>
                <p class="scheme-description">
                    Log in and complete your profile to see personalized
                    scheme recommendations.
                </p>
                <button class="btn outline card-action"
                    onclick="showPage('profile')">
                    Open Profile →
                </button>
            </div>
        `;
        return;
    }

    const matchedSchemes = schemes.filter(scheme =>
        checkEligibility(scheme, currentProfile).eligible
    );

    if (matchedSchemes.length === 0) {
        container.innerHTML = `
            <div class="scheme-card">
                <h3>No matching schemes found</h3>
                <p class="scheme-description">
                    No schemes currently match the configured demonstration
                    rules. Check your profile details or explore all schemes.
                </p>
                <button class="btn outline card-action"
                    onclick="showPage('explore')">
                    Explore All Schemes →
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = matchedSchemes
        .slice(0, 3)
        .map(scheme => createSchemeCard(scheme))
        .join("");
}


/* =====================================================
   SCHEME CARD
===================================================== */

function createSchemeCard(scheme) {
    const isSaved = savedSchemes.includes(getSchemeId(scheme));
    const result = checkEligibility(scheme, currentProfile);

    let eligibilityText;

    if (result.eligible) {
        eligibilityText = "✓ Matches configured rules";
    } else if (result.status === "Complete your profile") {
        eligibilityText = "ⓘ Complete your profile";
    } else {
        eligibilityText = "ⓘ Does not match configured rules";
    }

    return `
        <article class="scheme-card">
            <div class="scheme-top">
                <div>
                    <span class="scheme-category">${scheme.category}</span>
                    <h3>${scheme.name}</h3>
                </div>

                <button
                    class="save-btn ${isSaved ? "saved" : ""}"
                    onclick="toggleSave('${getSchemeId(scheme)}')"
                    aria-label="${isSaved ? "Remove saved scheme" : "Save scheme"}"
                >
                    ${isSaved ? "♥" : "♡"}
                </button>
            </div>

            <p class="scheme-description">${scheme.description}</p>

            <p class="eligibility">${eligibilityText}</p>

            <div class="scheme-meta">
                <div>
                    <span>Benefit</span>
                    <strong>${scheme.benefit}</strong>
                </div>

                <div>
                    <span>Deadline</span>
                    <strong>${scheme.deadline}</strong>
                </div>
            </div>

            <button
                class="btn outline card-action"
                onclick="openDetails('${getSchemeId(scheme)}')"
            >
                View Details →
            </button>
        </article>
    `;
}


/* =====================================================
   EXPLORE BENEFITS
===================================================== */

function renderExplore() {
    const container = document.getElementById("exploreList");

    if (!container) return;

    const search = (
        document.getElementById("searchInput")?.value || ""
    ).toLowerCase();

    const selectedCategory =
        document.getElementById("categoryFilter")?.value || "All";

    const category =
        currentCategory !== "All" ? currentCategory : selectedCategory;

    const filtered = schemes.filter(scheme => {
        const matchesSearch =
            scheme.name.toLowerCase().includes(search) ||
            scheme.category.toLowerCase().includes(search) ||
            scheme.description.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || scheme.category === category;

        return matchesSearch && matchesCategory;
    });

    const resultText = document.getElementById("resultText");

    if (resultText) {
        resultText.textContent =
            `${filtered.length} benefit${filtered.length === 1 ? "" : "s"} available`;
    }

    container.innerHTML = filtered.length
        ? filtered.map(scheme => createSchemeCard(scheme)).join("")
        : `
            <div class="scheme-card">
                <h3>No benefits found</h3>
                <p class="scheme-description">
                    Try another search or category.
                </p>
            </div>
        `;
}


/* =====================================================
   CATEGORY FILTER
===================================================== */

function setCategory(category, button) {
    currentCategory = category;

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    document.getElementById("categoryFilter").value = category;

    renderExplore();
}


/* =====================================================
   SAVE / UNSAVE BENEFITS
===================================================== */

function toggleSave(id) {
    id = String(id);

    if (savedSchemes.includes(id)) {
        savedSchemes = savedSchemes.filter(item => item !== id);
        showToast("Removed from saved benefits.");
    } else {
        savedSchemes.push(id);
        showToast("Saved to your benefits.");
    }

    localStorage.setItem("savedSchemes", JSON.stringify(savedSchemes));

    updateUser();
    renderRecommended();
    renderExplore();
    renderSaved();

    if (currentScheme && getSchemeId(currentScheme) === id) {
        updateSaveButton();
    }
}


/* =====================================================
   SAVED BENEFITS
===================================================== */

function renderSaved() {
    const container = document.getElementById("savedList");

    if (!container) return;

    const saved = schemes.filter(scheme =>
    savedSchemes.includes(getSchemeId(scheme))
    );

    if (!saved.length) {
        container.innerHTML = `
            <div class="scheme-card">
                <h3>No saved benefits</h3>
                <p class="scheme-description">
                    Save a benefit to find it here later.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = saved
        .map(scheme => createSchemeCard(scheme))
        .join("");
}


/* =====================================================
   DEADLINES
===================================================== */

function renderDeadlines() {
    const container = document.getElementById("deadlineList");

    if (!container) return;

    container.innerHTML = schemes.map(scheme => {
        const dateParts = scheme.deadline.split(" ");

        return `
            <div class="deadline-card">
                <div class="date-box">
                    <strong>${dateParts[0]}</strong>
                    <span>${dateParts[1].substring(0, 3).toUpperCase()}</span>
                </div>

                <div>
                    <h3>${scheme.name}</h3>
                    <p>${scheme.category} • ${scheme.benefit}</p>
                </div>

                <button
                    class="btn outline"
                    onclick="openDetails('${getSchemeId(scheme)}')"
                >
                    View
                </button>
            </div>
        `;
    }).join("");
}


/* =====================================================
   SCHEME DETAILS
===================================================== */

function openDetails(id) {
    currentScheme = schemes.find(
    scheme => getSchemeId(scheme) === String(id)
);

    if (!currentScheme) {
        showToast("Scheme not found.");
        return;
    }

    document.getElementById("detailCategory").textContent =
        currentScheme.category;

    document.getElementById("detailName").textContent =
        currentScheme.name;

    document.getElementById("detailDescription").textContent =
        currentScheme.description;

    document.getElementById("detailBenefit").textContent =
        currentScheme.benefit;

    document.getElementById("detailDeadline").textContent =
        currentScheme.deadline;

    // Show eligibility information in the existing description area.
    const result = checkEligibility(currentScheme, currentProfile);

    document.getElementById("detailDescription").textContent =
        `${currentScheme.description} Eligibility status: ${result.status}. ${result.reasons.join(" ")}`;

    updateSaveButton();

    document.getElementById("applyBtn").onclick = function () {
        window.open(currentScheme.url, "_blank", "noopener,noreferrer");
    };

    document.getElementById("detailsModal").classList.remove("hidden");
}


function updateSaveButton() {
    if (!currentScheme) return;

    const button = document.getElementById("saveDetailBtn");
    if (!button) return;

    const isSaved = savedSchemes.includes(getSchemeId(currentScheme));

    button.textContent = isSaved ? "♥ Saved" : "♡ Save Benefit";

    button.onclick = function () {
        toggleSave(getSchemeId(currentScheme));
    };
}


function closeDetails() {
    document.getElementById("detailsModal").classList.add("hidden");
}


/* =====================================================
   PROFILE
===================================================== */

async function loadProfile() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        showToast("Please log in again to load your profile.");
        return;
    }

    try {
        const response = await fetch(
            `/api/users/profile/${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load profile.");
        }

        const user = data.user;

        currentProfile = user;

        document.getElementById("pName").value = user.name || "";
        document.getElementById("pAge").value = user.age ?? "";
        document.getElementById("pGender").value = user.gender || "Female";
        document.getElementById("pState").value = user.state || "Kerala";
        document.getElementById("pDistrict").value = user.district || "";
        document.getElementById("pEducation").value =
            user.education || "Undergraduate";
        document.getElementById("pOccupation").value =
            user.occupation || "Student";

        const incomeLabels = {
            250000: "Below ₹2.5 lakh",
            500000: "₹2.5 - ₹5 lakh",
            1000000: "₹5 - ₹10 lakh",
            1000001: "Above ₹10 lakh"
        };

        document.getElementById("pIncome").value =
            incomeLabels[user.income] || "Below ₹2.5 lakh";

        document.getElementById("pCategory").value =
            user.category || "OBC";

        document.getElementById("pDisability").value =
            user.disability ? "Yes" : "No";

        localStorage.setItem("userName", user.name);
        localStorage.setItem("userEmail", user.email);

        updateUser();
        renderRecommended();
        renderExplore();
        renderSaved();

    } catch (error) {
        console.error("Load profile error:", error);
        showToast(error.message || "Unable to load profile.");
    }
}


function toggleEditProfile() {
    const fields = document.querySelectorAll(
        "#profileForm input, #profileForm select"
    );

    const saveArea = document.getElementById("profileSaveArea");
    const isCurrentlyDisabled = fields[0].disabled;

    fields.forEach(field => {
        field.disabled = !isCurrentlyDisabled;
    });

    saveArea.classList.toggle("hidden", !isCurrentlyDisabled);
}


async function saveProfile() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        showToast("Please log in again before saving.");
        return;
    }

    const name = document.getElementById("pName").value.trim();

    if (!name) {
        showToast("Please enter your name.");
        return;
    }

    const profileData = {
        name,
        age: document.getElementById("pAge").value,
        gender: document.getElementById("pGender").value,
        state: document.getElementById("pState").value,
        district: document.getElementById("pDistrict").value.trim(),
        education: document.getElementById("pEducation").value,
        occupation: document.getElementById("pOccupation").value,
        income: document.getElementById("pIncome").value,
        category: document.getElementById("pCategory").value,
        disability: document.getElementById("pDisability").value
    };

    try {
        const response = await fetch(
            `/api/users/profile/${encodeURIComponent(userId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(profileData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to save profile.");
        }

        localStorage.setItem("userName", data.user.name);

        currentProfile = data.user;

        updateUser();
        await loadProfile();

        toggleEditProfile();

        showToast("Profile updated successfully.");

    } catch (error) {
        console.error("Save profile error:", error);
        showToast(error.message || "Unable to save profile.");
    }
}


/* =====================================================
   ADMIN
===================================================== */

function openAdminForm() {
    showPage("adminForm");
}




async function addScheme() {
    const name = document.getElementById("aName").value.trim();
    const category = document.getElementById("aCategory").value;
    const benefit = document.getElementById("aBenefit").value.trim();
    const deadline = document.getElementById("aDeadline").value.trim();

    const url =
        document.getElementById("aUrl").value.trim() ||
        "https://www.india.gov.in";

    const description =
        document.getElementById("aDescription").value.trim();

    const eligibilityText =
        document.getElementById("aEligibility").value.trim();

    if (!name || !category || !benefit || !deadline) {
        showToast("Please fill in all required fields.");
        return;
    }

    let eligibility;

    try {
        eligibility = JSON.parse(eligibilityText);

        if (
            eligibility === null ||
            typeof eligibility !== "object" ||
            Array.isArray(eligibility)
        ) {
            throw new Error("Eligibility must be a JSON object.");
        }

        if (Object.keys(eligibility).length === 0) {
            showToast("Please enter eligibility rules.");
            return;
        }
    } catch (error) {
        showToast("Enter valid, non-empty eligibility rules in JSON format.");
        return;
    }

    try {
        const response = await fetch("/api/schemes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization":
                    "Bearer " + sessionStorage.getItem("adminToken")
            },
            body: JSON.stringify({
                name,
                category,
                benefit,
                deadline,
                url,
                description,
                eligibility
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to add scheme.");
        }

        document.getElementById("aName").value = "";
        document.getElementById("aBenefit").value = "";
        document.getElementById("aDeadline").value = "";
        document.getElementById("aUrl").value = "";
        document.getElementById("aDescription").value = "";
        document.getElementById("aEligibility").value = "";

        await loadAdminSchemes();

        showPage("admin");
        showToast("Scheme added successfully.");
    } catch (error) {
        console.error("Add scheme error:", error);
        showToast(error.message || "Unable to add scheme.");
    }
}



async function loadAdminSchemes() {
    const table = document.getElementById("adminTable");

    if (table) {
        table.innerHTML = `
            <tr>
                <td colspan="5">Loading schemes...</td>
            </tr>
        `;
    }

    try {
        const response = await fetch("/api/schemes");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load schemes.");
        }

        // Replace the displayed list with database schemes
        schemes.splice(0, schemes.length, ...data);

        renderAdminTable();
        renderExplore();
        renderRecommended();
        renderSaved();
        renderDeadlines();

    } catch (error) {
        console.error("Load schemes error:", error);

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="5">Unable to load schemes.</td>
                </tr>
            `;
        }

        showToast("Unable to load schemes from MongoDB.");
    }
}


/* =====================================================
   ADMIN TABLE
===================================================== */


function renderAdminTable() {
    const table = document.getElementById("adminTable");

    if (!table) return;

    if (schemes.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No schemes found.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = schemes.map(scheme => `
        <tr>
            <td><strong>${scheme.name}</strong></td>
            <td>${scheme.category}</td>
            <td>
                <span class="status">
                    ${scheme.active === false ? "Inactive" : "Active"}
                </span>
            </td>
            <td>${scheme.deadline}</td>
            <td>
                <button
                    class="text-btn"
                    onclick="openDetails('${scheme._id || scheme.id}')"
                >
                    View
                </button>
            </td>
        </tr>
    `).join("");
}



/* =====================================================
   TOAST MESSAGE
===================================================== */

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2200);
}