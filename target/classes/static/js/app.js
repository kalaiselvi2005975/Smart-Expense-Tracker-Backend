// --- State Management ---
const STATE = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    expenses: [],
    currentTab: 'dashboard-tab',
    filters: {
        category: '',
        startDate: '',
        endDate: ''
    },
    // Colors for different expense categories
    categoryColors: {
        'Food': '#10b981',        /* Emerald Green */
        'Travel': '#3b82f6',      /* Blue */
        'Utilities': '#f59e0b',   /* Amber */
        'Entertainment': '#8b5cf6',/* Purple */
        'Shopping': '#ec4899',    /* Pink */
        'Housing': '#3a0ca3',     /* Deep Indigo */
        'Other': '#6b7280'        /* Gray */
    }
};

// --- DOM Elements ---
const DOM = {
    authSection: document.getElementById('auth-section'),
    appSection: document.getElementById('app-section'),
    
    // Auth Forms
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    goToRegister: document.getElementById('go-to-register'),
    goToLogin: document.getElementById('go-to-login'),
    
    // Profile Display
    userDisplayName: document.getElementById('user-display-name'),
    userDisplayEmail: document.getElementById('user-display-email'),
    userAvatarInitials: document.getElementById('user-avatar-initials'),
    profileName: document.getElementById('profile-name'),
    profileEmail: document.getElementById('profile-email'),
    profileAvatarInitials: document.getElementById('profile-avatar-initials'),
    profileJoinedDate: document.getElementById('profile-joined-date'),
    profileUpdateForm: document.getElementById('profile-update-form'),
    profileEditName: document.getElementById('profile-edit-name'),
    profileEditPassword: document.getElementById('profile-edit-password'),
    
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    pageTitle: document.getElementById('page-title'),
    logoutBtn: document.getElementById('logout-btn'),
    mobileSidebarToggle: document.getElementById('mobile-sidebar-toggle'),
    sidebar: document.querySelector('.sidebar'),
    drawerOverlay: document.getElementById('sidebar-drawer-overlay'),
    
    // Dashboard Tab
    dashboardTotalSpent: document.getElementById('dashboard-total-spent'),
    dashboardSummaryMonth: document.getElementById('dashboard-summary-month'),
    dashboardYearSelect: document.getElementById('dashboard-year-select'),
    dashboardMonthSelect: document.getElementById('dashboard-month-select'),
    updateDashboardBtn: document.getElementById('update-dashboard-btn'),
    categoryBreakdownContainer: document.getElementById('category-breakdown-container'),
    recentExpensesContainer: document.getElementById('recent-expenses-container'),
    
    // Expenses Tab
    filtersForm: document.getElementById('filters-form'),
    filterCategory: document.getElementById('filter-category'),
    filterStartDate: document.getElementById('filter-start-date'),
    filterEndDate: document.getElementById('filter-end-date'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    expensesTableBody: document.getElementById('expenses-table-body'),
    ledgerCount: document.getElementById('ledger-count'),
    
    // Modals
    expenseModal: document.getElementById('expense-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    cancelModalBtn: document.getElementById('cancel-modal-btn'),
    expenseForm: document.getElementById('expense-form'),
    modalTitle: document.getElementById('modal-title'),
    saveExpenseBtn: document.getElementById('save-expense-btn'),
    expenseId: document.getElementById('expense-id'),
    expenseAmount: document.getElementById('expense-amount'),
    expenseCategory: document.getElementById('expense-category'),
    expenseDate: document.getElementById('expense-date'),
    expenseDescription: document.getElementById('expense-description'),
    openAddModalBtns: document.querySelectorAll('.open-add-modal-btn'),
    
    // Toasts
    toastContainer: document.getElementById('toast-container')
};

// --- Toast Notifications helper ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    // Add close event
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'fadeIn 0.2s ease reverse forwards';
        setTimeout(() => toast.remove(), 200);
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeIn 0.2s ease reverse forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 200);
        }
    }, 4000);
}

// --- API Request Wrapper ---
async function apiCall(endpoint, options = {}) {
    const url = endpoint;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (STATE.token) {
        headers['Authorization'] = `Bearer ${STATE.token}`;
    }
    
    const fetchOptions = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            handleLogout();
            showToast('Session expired. Please log in again.', 'error');
            throw new Error('Unauthorized');
        }
        
        // If DELETE request or empty body
        if (response.status === 204) return null;
        
        const responseText = await response.text();
        let data = null;
        
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`API error (${response.status}): ${responseText.substring(0, 100)}`);
                }
                throw new Error(`Invalid response format: ${responseText.substring(0, 100)}`);
            }
        }
        
        if (!response.ok) {
            const errorMsg = (data && data.message) || `API error (${response.status})`;
            throw new Error(errorMsg);
        }
        
        return data;
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            console.error('API call error:', error);
        }
        throw error;
    }
}

// --- Auth Operations ---
async function handleLogin(email, password) {
    try {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        STATE.token = data.token;
        STATE.user = {
            id: data.userId,
            name: data.name,
            email: data.email
        };
        
        localStorage.setItem('token', STATE.token);
        localStorage.setItem('user', JSON.stringify(STATE.user));
        
        showToast(`Welcome back, ${data.name}!`);
        initApp();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleRegister(name, email, password) {
    try {
        const data = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        STATE.token = data.token;
        STATE.user = {
            id: data.userId,
            name: data.name,
            email: data.email
        };
        
        localStorage.setItem('token', STATE.token);
        localStorage.setItem('user', JSON.stringify(STATE.user));
        
        showToast(`Account created! Welcome, ${data.name}!`);
        initApp();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function handleLogout() {
    STATE.token = null;
    STATE.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    DOM.appSection.classList.add('d-none');
    DOM.authSection.classList.remove('d-none');
    
    // Clear forms
    DOM.loginForm.reset();
    DOM.registerForm.reset();
}

// --- Navigation Tab Switcher ---
function switchTab(tabId) {
    STATE.currentTab = tabId;
    
    DOM.navItems.forEach(item => {
        if (item.getAttribute('data-target') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    DOM.tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.remove('d-none');
            content.classList.add('active');
        } else {
            content.classList.add('d-none');
            content.classList.remove('active');
        }
    });
    
    // Dynamic titles
    let title = 'Dashboard';
    if (tabId === 'expenses-tab') title = 'Expense Ledger';
    if (tabId === 'profile-tab') title = 'Profile Settings';
    DOM.pageTitle.textContent = title;
    
    // Mobile menu drawer auto close
    DOM.sidebar.classList.remove('open');
    DOM.drawerOverlay.classList.add('d-none');
    
    // Load content dynamically depending on selected tab
    if (tabId === 'dashboard-tab') {
        loadDashboardData();
    } else if (tabId === 'expenses-tab') {
        loadExpenses();
    } else if (tabId === 'profile-tab') {
        populateProfileDetails();
    }
}

// --- Initialization & Dashboard Populate ---
async function initApp() {
    DOM.authSection.classList.add('d-none');
    DOM.appSection.classList.remove('d-none');
    
    // Display header details
    if (STATE.user) {
        DOM.userDisplayName.textContent = STATE.user.name;
        DOM.userDisplayEmail.textContent = STATE.user.email;
        DOM.userAvatarInitials.textContent = STATE.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        DOM.profileAvatarInitials.textContent = DOM.userAvatarInitials.textContent;
    }
    
    // Set default month/year for selection
    const now = new Date();
    populateDashboardSelectors(now.getFullYear(), now.getMonth() + 1);
    
    // Load initial tab
    switchTab('dashboard-tab');
}

function populateDashboardSelectors(currentYear, currentMonth) {
    DOM.dashboardYearSelect.innerHTML = '';
    DOM.dashboardMonthSelect.innerHTML = '';
    
    // Populate past 5 years down to current year
    for (let y = currentYear; y >= currentYear - 5; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        DOM.dashboardYearSelect.appendChild(opt);
    }
    
    // Populate months
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthNames.forEach((name, index) => {
        const opt = document.createElement('option');
        opt.value = index + 1;
        opt.textContent = name;
        if (index + 1 === currentMonth) opt.selected = true;
        DOM.dashboardMonthSelect.appendChild(opt);
    });
}

// --- Fetch Dashboard Summaries ---
async function loadDashboardData() {
    const year = parseInt(DOM.dashboardYearSelect.value);
    const month = parseInt(DOM.dashboardMonthSelect.value);
    
    const monthName = DOM.dashboardMonthSelect.options[DOM.dashboardMonthSelect.selectedIndex].text;
    DOM.dashboardSummaryMonth.textContent = `${monthName} ${year}`;
    
    try {
        // Fetch Monthly Summary
        const summary = await apiCall(`/api/expenses/summary/monthly?year=${year}&month=${month}`);
        
        // Display summary total
        DOM.dashboardTotalSpent.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.totalAmount);
        
        // Render category breakdown
        renderCategoryBreakdown(summary.categoryBreakdown, summary.totalAmount);
        
        // Fetch recent expenses
        const allExpenses = await apiCall('/api/expenses');
        renderRecentExpenses(allExpenses);
        
    } catch (error) {
        showToast('Failed to load summary stats', 'error');
    }
}

function renderCategoryBreakdown(breakdown, total) {
    DOM.categoryBreakdownContainer.innerHTML = '';
    
    if (!breakdown || breakdown.length === 0 || total === 0) {
        DOM.categoryBreakdownContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fa-solid fa-chart-bar d-block mb-2 text-2xl"></i>
                No expense entries found for this month.
            </div>`;
        return;
    }
    
    // Sort by amount desc
    const sorted = [...breakdown].sort((a, b) => b.amount - a.amount);
    
    sorted.forEach(item => {
        const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
        const color = STATE.categoryColors[item.category] || STATE.categoryColors['Other'];
        
        const div = document.createElement('div');
        div.className = 'category-progress-item';
        div.innerHTML = `
            <div class="category-progress-info">
                <span class="category-name">
                    <span class="category-bullet" style="background-color: ${color}"></span>
                    ${getCategoryDisplayName(item.category)}
                </span>
                <span class="category-amount">
                    ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)} 
                    <span class="text-muted" style="font-size: 0.75rem">(${pct}%)</span>
                </span>
            </div>
            <div class="category-progress-bar-bg">
                <div class="category-progress-bar-fill" style="background-color: ${color}; width: ${pct}%"></div>
            </div>
        `;
        DOM.categoryBreakdownContainer.appendChild(div);
    });
}

function renderRecentExpenses(expenses) {
    DOM.recentExpensesContainer.innerHTML = '';
    
    if (!expenses || expenses.length === 0) {
        DOM.recentExpensesContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fa-solid fa-receipt d-block mb-2 text-2xl"></i>
                No expense logs yet.
            </div>`;
        return;
    }
    
    // Sort by date desc, then take top 5
    const recent = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
        
    recent.forEach(item => {
        const color = STATE.categoryColors[item.category] || STATE.categoryColors['Other'];
        const icon = getCategoryIcon(item.category);
        
        const div = document.createElement('div');
        div.className = 'recent-item';
        div.innerHTML = `
            <div class="recent-item-meta">
                <div class="recent-item-icon" style="color: ${color}">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="recent-item-details">
                    <h4>${item.description || getCategoryDisplayName(item.category)}</h4>
                    <p>${formatLocalDate(item.date)} · <span class="text-muted">${getCategoryDisplayName(item.category)}</span></p>
                </div>
            </div>
            <div class="recent-item-value" style="color: ${color}">
                -${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}
            </div>
        `;
        DOM.recentExpensesContainer.appendChild(div);
    });
}

// --- Fetch Expense Ledger ---
async function loadExpenses() {
    let endpoint = '/api/expenses';
    const params = [];
    
    if (STATE.filters.category) {
        params.push(`category=${encodeURIComponent(STATE.filters.category)}`);
    }
    if (STATE.filters.startDate && STATE.filters.endDate) {
        params.push(`startDate=${STATE.filters.startDate}`);
        params.push(`endDate=${STATE.filters.endDate}`);
    }
    
    if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
    }
    
    try {
        const data = await apiCall(endpoint);
        STATE.expenses = data;
        renderExpensesTable(data);
    } catch (error) {
        showToast('Failed to fetch expenses ledger', 'error');
    }
}

function renderExpensesTable(data) {
    DOM.expensesTableBody.innerHTML = '';
    DOM.ledgerCount.textContent = `${data.length} item${data.length === 1 ? '' : 's'}`;
    
    if (!data || data.length === 0) {
        DOM.expensesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    No expense records match your filter criteria.
                </td>
            </tr>`;
        return;
    }
    
    // Sort by date desc
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatLocalDate(item.date)}</td>
            <td>
                <span class="category-name">
                    <span class="category-bullet" style="background-color: ${STATE.categoryColors[item.category] || STATE.categoryColors['Other']}"></span>
                    ${getCategoryDisplayName(item.category)}
                </span>
            </td>
            <td>${escapeHtml(item.description || '—')}</td>
            <td class="text-right" style="font-weight:600; color: #fff;">
                ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-icon-edit edit-expense-btn" data-id="${item.id}" title="Edit Expense">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn-icon btn-icon-delete delete-expense-btn" data-id="${item.id}" title="Delete Expense">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        DOM.expensesTableBody.appendChild(tr);
    });
    
    // Hook actions
    document.querySelectorAll('.edit-expense-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            openEditExpenseModal(id);
        });
    });
    
    document.querySelectorAll('.delete-expense-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            handleDeleteExpense(id);
        });
    });
}

// --- Add / Edit Expense Modal handling ---
function openAddExpenseModal() {
    DOM.modalTitle.textContent = 'Add New Expense';
    DOM.expenseId.value = '';
    DOM.expenseForm.reset();
    DOM.saveExpenseBtn.querySelector('span').textContent = 'Add Expense';
    
    // Pre-populate with today's date in local browser format
    const today = new Date().toISOString().split('T')[0];
    DOM.expenseDate.value = today;
    
    DOM.expenseModal.classList.remove('d-none');
}

function openEditExpenseModal(id) {
    const expense = STATE.expenses.find(e => e.id === id);
    if (!expense) return;
    
    DOM.modalTitle.textContent = 'Edit Expense Record';
    DOM.expenseId.value = expense.id;
    DOM.expenseAmount.value = expense.amount;
    DOM.expenseCategory.value = expense.category;
    DOM.expenseDate.value = expense.date;
    DOM.expenseDescription.value = expense.description || '';
    DOM.saveExpenseBtn.querySelector('span').textContent = 'Update Expense';
    
    DOM.expenseModal.classList.remove('d-none');
}

function closeModal() {
    DOM.expenseModal.classList.add('d-none');
}

async function handleExpenseFormSubmit(e) {
    e.preventDefault();
    
    const id = DOM.expenseId.value;
    const requestData = {
        amount: parseFloat(DOM.expenseAmount.value),
        category: DOM.expenseCategory.value,
        date: DOM.expenseDate.value,
        description: DOM.expenseDescription.value
    };
    
    const isEdit = id !== '';
    const endpoint = isEdit ? `/api/expenses/${id}` : '/api/expenses';
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        await apiCall(endpoint, {
            method: method,
            body: JSON.stringify(requestData)
        });
        
        showToast(isEdit ? 'Expense updated successfully!' : 'New expense added successfully!');
        closeModal();
        
        // Refresh the active view
        if (STATE.currentTab === 'dashboard-tab') {
            loadDashboardData();
        } else {
            loadExpenses();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleDeleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    
    try {
        await apiCall(`/api/expenses/${id}`, {
            method: 'DELETE'
        });
        
        showToast('Expense deleted successfully.');
        
        // Refresh ledger
        loadExpenses();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// --- Profile Settings ---
async function populateProfileDetails() {
    try {
        const userDetails = await apiCall('/api/users/profile');
        
        DOM.profileName.textContent = userDetails.name;
        DOM.profileEmail.textContent = userDetails.email;
        DOM.profileEditName.value = userDetails.name;
        DOM.profileEditPassword.value = '';
        
        // Save back updated user details just in case they changed
        STATE.user = { id: userDetails.id, name: userDetails.name, email: userDetails.email };
        localStorage.setItem('user', JSON.stringify(STATE.user));
        
        // Update sidebar as well
        DOM.userDisplayName.textContent = STATE.user.name;
        DOM.userAvatarInitials.textContent = STATE.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        DOM.profileAvatarInitials.textContent = DOM.userAvatarInitials.textContent;
        
        // Format join date
        if (userDetails.createdAt) {
            const joinedDate = new Date(userDetails.createdAt);
            DOM.profileJoinedDate.textContent = `Joined: ${joinedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        } else {
            DOM.profileJoinedDate.textContent = 'Active Member';
        }
        
    } catch (error) {
        showToast('Failed to pull user profile data', 'error');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const requestData = {
        name: DOM.profileEditName.value
    };
    
    if (DOM.profileEditPassword.value.trim() !== '') {
        requestData.password = DOM.profileEditPassword.value;
    }
    
    try {
        await apiCall('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(requestData)
        });
        
        showToast('Profile settings saved successfully.');
        DOM.profileEditPassword.value = '';
        populateProfileDetails();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// --- Category Helpers ---
function getCategoryDisplayName(category) {
    const displayMap = {
        'Food': 'Food & Dining',
        'Travel': 'Travel & Transport',
        'Utilities': 'Utilities & Bills',
        'Entertainment': 'Entertainment',
        'Shopping': 'Shopping',
        'Housing': 'Housing & Rent',
        'Other': 'Other Expenses'
    };
    return displayMap[category] || category;
}

function getCategoryIcon(category) {
    const iconMap = {
        'Food': 'fa-utensils',
        'Travel': 'fa-plane-departure',
        'Utilities': 'fa-bolt-lightning',
        'Entertainment': 'fa-film',
        'Shopping': 'fa-bag-shopping',
        'Housing': 'fa-house-chimney',
        'Other': 'fa-asterisk'
    };
    return iconMap[category] || 'fa-receipt';
}

// --- Date Formatter Helper ---
function formatLocalDate(dateStr) {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// --- HTML Escaper Helper ---
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- Event Listeners Registration ---
function registerEventListeners() {
    // Switch between Login/Register forms
    DOM.goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.loginForm.classList.remove('active');
        setTimeout(() => DOM.registerForm.add('active'), 0); // micro-delay
        DOM.registerForm.classList.add('active');
        document.getElementById('auth-subtitle').textContent = 'Create a secure account today';
    });
    
    DOM.goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.registerForm.classList.remove('active');
        DOM.loginForm.classList.add('active');
        document.getElementById('auth-subtitle').textContent = 'Track, analyze, and optimize your spending';
    });
    
    // Auth Forms Submission
    DOM.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        handleLogin(email, password);
    });
    
    DOM.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        if (password.length < 6) {
            showToast('Password must be at least 6 characters long.', 'error');
            return;
        }
        handleRegister(name, email, password);
    });
    
    // Logout Action
    DOM.logoutBtn.addEventListener('click', handleLogout);
    
    // Tab switching buttons
    DOM.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            switchTab(target);
        });
    });
    
    // Dashboard selectors & refresh button
    DOM.updateDashboardBtn.addEventListener('click', loadDashboardData);
    DOM.dashboardYearSelect.addEventListener('change', loadDashboardData);
    DOM.dashboardMonthSelect.addEventListener('change', loadDashboardData);
    
    // Ledger Filter Form Submission
    DOM.filtersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        STATE.filters.category = DOM.filterCategory.value;
        STATE.filters.startDate = DOM.filterStartDate.value;
        STATE.filters.endDate = DOM.filterEndDate.value;
        
        // Date range checks
        if ((STATE.filters.startDate && !STATE.filters.endDate) || (!STATE.filters.startDate && STATE.filters.endDate)) {
            showToast('Please select both start and end dates to filter by range.', 'error');
            return;
        }
        
        loadExpenses();
    });
    
    // Clear Ledger Filters
    DOM.clearFiltersBtn.addEventListener('click', () => {
        DOM.filtersForm.reset();
        STATE.filters = { category: '', startDate: '', endDate: '' };
        loadExpenses();
    });
    
    // Profile Update Submission
    DOM.profileUpdateForm.addEventListener('submit', handleProfileUpdate);
    
    // Modal Open and Close
    DOM.openAddModalBtns.forEach(btn => {
        btn.addEventListener('click', openAddExpenseModal);
    });
    DOM.closeModalBtn.addEventListener('click', closeModal);
    DOM.cancelModalBtn.addEventListener('click', closeModal);
    
    // Backdrop click close modal
    DOM.expenseModal.addEventListener('click', (e) => {
        if (e.target === DOM.expenseModal) closeModal();
    });
    
    // Submit Expense Form
    DOM.expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    
    // Mobile Drawer Navigation toggle
    DOM.mobileSidebarToggle.addEventListener('click', () => {
        DOM.sidebar.classList.add('open');
        DOM.drawerOverlay.classList.remove('d-none');
    });
    DOM.drawerOverlay.addEventListener('click', () => {
        DOM.sidebar.classList.remove('open');
        DOM.drawerOverlay.classList.add('d-none');
    });
    
    // Simulate links (e.g. "View All" on Dashboard)
    document.querySelectorAll('.nav-link-simulate').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('data-target');
            switchTab(target);
        });
    });
}

// --- App Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
    registerEventListeners();
    
    if (STATE.token) {
        initApp();
    } else {
        DOM.authSection.classList.remove('d-none');
    }
});
