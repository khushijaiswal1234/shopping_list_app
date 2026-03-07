/* =========================================
   Application State & Data
   ========================================= */

// Available colors for spaces
const ACCENT_COLORS = [
    { id: 'cat-1', value: 'var(--cat-1)' },
    { id: 'cat-2', value: 'var(--cat-2)' },
    { id: 'cat-3', value: 'var(--cat-3)' },
    { id: 'cat-4', value: 'var(--cat-4)' },
    { id: 'cat-5', value: 'var(--cat-5)' }
];

// Initial Mock Data
let spaces = [
    {
        id: '1',
        title: 'Weekly Groceries',
        icon: 'fa-basket-shopping',
        color: 'var(--cat-1)',
        items: [
            { id: '1-1', name: 'Organic Milk', completed: false },
            { id: '1-2', name: 'Sourdough Bread', completed: true },
            { id: '1-3', name: 'Eggs (Dozen)', completed: false },
            { id: '1-4', name: 'Avocados', completed: false }
        ]
    },
    {
        id: '2',
        title: 'Office Restock',
        icon: 'fa-briefcase',
        color: 'var(--cat-3)',
        items: [
            { id: '2-1', name: 'Printer Paper', completed: true },
            { id: '2-2', name: 'Black Ink Cartridge', completed: false },
            { id: '2-3', name: 'Sticky Notes', completed: false }
        ]
    }
];

let activeSpaceId = null;

// Mock Family Members
let familyMembers = [
    { id: 'f1', name: 'John Jenkins', role: 'Spouse', color: 'var(--cat-3)' },
    { id: 'f2', name: 'Emily Jenkins', role: 'Daughter', color: 'var(--cat-2)' }
];

/* =========================================
   DOM Elements
   ========================================= */
const dashboardView = document.getElementById('dashboard-view');
const listView = document.getElementById('list-view');
const profileView = document.getElementById('profile-view');
const spacesContainer = document.getElementById('spaces-container');
const itemsContainer = document.getElementById('items-container');
const familyMembersContainer = document.getElementById('family-members-container');

// Profile Header Elements
const profileBtn = document.getElementById('profile-btn');
const profileBackBtn = document.getElementById('profile-back-btn');

// List View Header Elements
const backBtn = document.getElementById('back-btn');
const currentListTitle = document.getElementById('current-list-title');
const currentListProgressTxt = document.getElementById('current-list-progress-txt');
const currentListProgressFill = document.getElementById('current-list-progress-fill');

// Add Item
const addItemForm = document.getElementById('add-item-form');
const newItemInput = document.getElementById('new-item-input');

// Add Space Modal
const addSpaceBtn = document.getElementById('add-space-btn');
const addSpaceModal = document.getElementById('add-space-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const closeSpaceModalBtn = document.getElementById('close-space-modal');
const newSpaceForm = document.getElementById('new-space-form');
const spaceNameInput = document.getElementById('space-name');
const colorPickerContainer = document.getElementById('color-picker-container');

let selectedNewSpaceColor = ACCENT_COLORS[0].value;

// Add Member Modal
const addMemberBtn = document.getElementById('add-member-btn');
const addMemberModal = document.getElementById('add-member-modal');
const closeMemberModalBtn = document.getElementById('close-member-modal');
const newMemberForm = document.getElementById('new-member-form');
const memberNameInput = document.getElementById('member-name');
const memberRoleInput = document.getElementById('member-role');

/* =========================================
   Initialization
   ========================================= */
function init() {
    renderSpaces();
    setupColorPicker();
    setupEventListeners();
}

/* =========================================
   Render Functions
   ========================================= */

// Render the grid of spaces on the dashboard
function renderSpaces() {
    spacesContainer.innerHTML = '';

    if (spaces.length === 0) {
        spacesContainer.innerHTML = `
            <div class="space-card empty-state" onclick="openAddSpaceModal()">
                <i class="fa-solid fa-plus"></i>
                <p>Create your first space</p>
            </div>
        `;
        return;
    }

    spaces.forEach(space => {
        const totalItems = space.items.length;
        const completedItems = space.items.filter(item => item.completed).length;
        const progressPercentage = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

        const card = document.createElement('div');
        card.className = 'space-card';
        card.innerHTML = `
            <div class="space-icon" style="background-color: ${space.color}">
                <i class="fa-solid ${space.icon}"></i>
            </div>
            <div class="space-info">
                <h3>${space.title}</h3>
                <p>${completedItems}/${totalItems} items found</p>
            </div>
            <div class="card-progress">
                <div class="card-progress-fill" style="width: ${progressPercentage}%; background-color: ${space.color}"></div>
            </div>
        `;

        card.addEventListener('click', () => openSpace(space.id));
        spacesContainer.appendChild(card);
    });
}

// Render the specific list items for the active space
function renderActiveSpace() {
    const space = spaces.find(s => s.id === activeSpaceId);
    if (!space) return;

    // Update Header
    currentListTitle.textContent = space.title;

    const totalItems = space.items.length;
    const completedItems = space.items.filter(item => item.completed).length;
    const progressPercentage = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

    currentListProgressTxt.textContent = `${completedItems}/${totalItems}`;
    currentListProgressFill.style.width = `${progressPercentage}%`;
    currentListProgressFill.style.backgroundColor = space.color;

    // Update Items List
    itemsContainer.innerHTML = '';

    if (totalItems === 0) {
        itemsContainer.innerHTML = `<p style="text-align:center; color: var(--text-secondary); margin-top: 32px;">No items yet. Add something below!</p>`;
        return;
    }

    // Sort: incomplete first, then completed
    const sortedItems = [...space.items].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    sortedItems.forEach(item => {
        const li = document.createElement('li');
        li.className = `list-item ${item.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <label class="checkbox-container">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleItemStatus('${item.id}')">
                <span class="checkmark" style="${item.completed ? `background-color: ${space.color}; border-color: ${space.color};` : ''}"></span>
            </label>
            <span class="item-name">${item.name}</span>
            <button class="delete-btn" aria-label="Delete item" onclick="deleteItem('${item.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        itemsContainer.appendChild(li);
    });
}

// Render Family Members
function renderFamilyMembers() {
    familyMembersContainer.innerHTML = '';

    if (familyMembers.length === 0) {
        familyMembersContainer.innerHTML = `<p style="text-align:center; color: var(--text-secondary); margin-top: 16px;">No family members added yet.</p>`;
        return;
    }

    familyMembers.forEach(member => {
        const initial = member.name.charAt(0).toUpperCase();
        const li = document.createElement('li');
        li.className = 'family-member-item';

        li.innerHTML = `
            <div class="member-avatar" style="background-color: ${member.color}">
                ${initial}
            </div>
            <div class="member-info">
                <h4>${member.name}</h4>
                <p>${member.role || 'Member'}</p>
            </div>
            <button class="remove-member-btn" aria-label="Remove member" onclick="removeFamilyMember('${member.id}')">
                <i class="fa-solid fa-user-minus"></i>
            </button>
        `;
        familyMembersContainer.appendChild(li);
    });
}

/* =========================================
   Interactions & Logic
   ========================================= */

// Navigation
function openSpace(spaceId) {
    activeSpaceId = spaceId;
    renderActiveSpace();

    // Switch views
    dashboardView.classList.remove('active');
    dashboardView.classList.add('hidden');

    setTimeout(() => {
        listView.classList.remove('hidden');
        listView.classList.add('active');
    }, 50); // Small delay for transition
}

function closeList() {
    activeSpaceId = null;
    renderSpaces(); // Re-render to update progress bars on dashboard

    listView.classList.remove('active');
    listView.classList.add('hidden');

    setTimeout(() => {
        dashboardView.classList.remove('hidden');
        dashboardView.classList.add('active');
    }, 50);
}

function openProfile() {
    renderFamilyMembers();

    // Switch views
    dashboardView.classList.remove('active');
    dashboardView.classList.add('hidden');
    listView.classList.remove('active');
    listView.classList.add('hidden');

    setTimeout(() => {
        profileView.classList.remove('hidden');
        profileView.classList.add('active');
    }, 50);
}

function closeProfile() {
    profileView.classList.remove('active');
    profileView.classList.add('hidden');

    setTimeout(() => {
        dashboardView.classList.remove('hidden');
        dashboardView.classList.add('active');
    }, 50);
}

// Item Actions
window.toggleItemStatus = function (itemId) {
    const space = spaces.find(s => s.id === activeSpaceId);
    if (!space) return;

    const item = space.items.find(i => i.id === itemId);
    if (item) {
        item.completed = !item.completed;
        renderActiveSpace();
    }
};

window.deleteItem = function (itemId) {
    const space = spaces.find(s => s.id === activeSpaceId);
    if (!space) return;

    space.items = space.items.filter(i => i.id !== itemId);
    renderActiveSpace();
};

function addNewItem(e) {
    e.preventDefault();
    const name = newItemInput.value.trim();
    if (!name || !activeSpaceId) return;

    const space = spaces.find(s => s.id === activeSpaceId);
    if (!space) return;

    const newItem = {
        id: Date.now().toString(),
        name: name,
        completed: false
    };

    space.items.unshift(newItem); // Add to top
    newItemInput.value = '';

    // Scroll to top of list briefly to show newly added item
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderActiveSpace();
}

// Space Modal Actions
function openAddSpaceModal() {
    modalBackdrop.classList.remove('hidden');
    addSpaceModal.classList.remove('hidden');
    spaceNameInput.focus();
}

function closeAddSpaceModal() {
    modalBackdrop.classList.add('hidden');
    addSpaceModal.classList.add('hidden');
    newSpaceForm.reset();
    selectColor(ACCENT_COLORS[0].value, document.querySelector('.color-option')); // reset color
}

function setupColorPicker() {
    colorPickerContainer.innerHTML = '';
    ACCENT_COLORS.forEach((color, index) => {
        const btn = document.createElement('div');
        btn.className = `color-option ${index === 0 ? 'selected' : ''}`;
        btn.style.backgroundColor = color.value;
        btn.onclick = (e) => selectColor(color.value, e.target);
        colorPickerContainer.appendChild(btn);
    });
}

function selectColor(colorValue, targetElement) {
    selectedNewSpaceColor = colorValue;
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    targetElement.classList.add('selected');
}

function createNewSpace(e) {
    e.preventDefault();
    const name = spaceNameInput.value.trim();
    if (!name) return;

    // Pick a random icon for demo purposes
    const icons = ['fa-bag-shopping', 'fa-cart-shopping', 'fa-house', 'fa-gift', 'fa-car'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newSpace = {
        id: Date.now().toString(),
        title: name,
        icon: randomIcon,
        color: selectedNewSpaceColor,
        items: []
    };

    spaces.push(newSpace);
    closeAddSpaceModal();
    renderSpaces();
}

// Member Actions
window.removeFamilyMember = function (memberId) {
    familyMembers = familyMembers.filter(m => m.id !== memberId);
    renderFamilyMembers();
};

function openAddMemberModal() {
    modalBackdrop.classList.remove('hidden');
    addMemberModal.classList.remove('hidden');
    memberNameInput.focus();
}

function closeAddMemberModal() {
    // Only close if space modal isn't also open (edge case)
    if (addSpaceModal.classList.contains('hidden')) {
        modalBackdrop.classList.add('hidden');
    }
    addMemberModal.classList.add('hidden');
    newMemberForm.reset();
}

function addNewFamilyMember(e) {
    e.preventDefault();
    const name = memberNameInput.value.trim();
    const role = memberRoleInput.value.trim();
    if (!name) return;

    // Pick a random color from ACCENT_COLORS
    const randomColor = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)].value;

    const newMember = {
        id: Date.now().toString(),
        name: name,
        role: role,
        color: randomColor
    };

    familyMembers.push(newMember);
    closeAddMemberModal();
    renderFamilyMembers();
}


/* =========================================
   Event Listeners
   ========================================= */
function setupEventListeners() {
    backBtn.addEventListener('click', closeList);
    addItemForm.addEventListener('submit', addNewItem);

    // Profile Navigation
    profileBtn.addEventListener('click', openProfile);
    profileBackBtn.addEventListener('click', closeProfile);

    // Modals
    addSpaceBtn.addEventListener('click', openAddSpaceModal);
    closeSpaceModalBtn.addEventListener('click', closeAddSpaceModal);

    addMemberBtn.addEventListener('click', openAddMemberModal);
    closeMemberModalBtn.addEventListener('click', closeAddMemberModal);

    modalBackdrop.addEventListener('click', () => {
        closeAddSpaceModal();
        closeAddMemberModal();
    });

    newSpaceForm.addEventListener('submit', createNewSpace);
    newMemberForm.addEventListener('submit', addNewFamilyMember);

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!addSpaceModal.classList.contains('hidden')) closeAddSpaceModal();
            if (!addMemberModal.classList.contains('hidden')) closeAddMemberModal();
        }
    });
}

// Boot the app
document.addEventListener('DOMContentLoaded', init);
