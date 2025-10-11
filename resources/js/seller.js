// Hardcoded credentials
const SELLER_CREDENTIALS = {
    username: '1234',
    password: '1234'
};

// Check if seller is logged in
let isLoggedIn = sessionStorage.getItem('sellerLoggedIn') === 'true';

// Products data (will be loaded from products.json)
let products = [];
let services = [];
let allItems = []; // Combined products + services

// Wishlist data (from localStorage)
let wishlistData = [];

document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Load products from products.json
    loadProducts();
    
    // Wishlist will be loaded after products are loaded (inside loadProducts)

    // Check login status
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === SELLER_CREDENTIALS.username && password === SELLER_CREDENTIALS.password) {
            sessionStorage.setItem('sellerLoggedIn', 'true');
            isLoggedIn = true;
            showDashboard();
            loginForm.reset();
            errorMessage.classList.remove('show');
        } else {
            errorMessage.textContent = 'Invalid username or password!';
            errorMessage.classList.add('show');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('sellerLoggedIn');
        isLoggedIn = false;
        showLogin();
    });

    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newProduct = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            price: '$' + parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value || 'https://via.placeholder.com/250x200/9C27B0/white?text=New+Product'
        };

        // Add to custom products in localStorage
        const customProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
        customProducts.push(newProduct);
        localStorage.setItem('sellerProducts', JSON.stringify(customProducts));
        
        // Reload all products to show the new one
        loadProducts();
        
        addProductForm.reset();
        
        const successMsg = document.getElementById('successMessage');
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 3000);
    });

    // Restore hidden items button
    const restoreBtn = document.getElementById('restoreBtn');
    restoreBtn.addEventListener('click', function() {
        if (confirm('Restore all hidden products?')) {
            localStorage.removeItem('hiddenProducts');
            loadProducts();
        }
    });

    // Initial render
    renderProducts();
});

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboard').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
}

function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    
    // Get IDs of custom products and services
    const customProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    const customServices = JSON.parse(localStorage.getItem('sellerServices') || '[]');
    const customIds = [...customProducts.map(p => p.id), ...customServices.map(s => s.id)];
    
    // Get hidden product IDs
    const hiddenIds = JSON.parse(localStorage.getItem('hiddenProducts') || '[]');
    
    // Show/hide restore button
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.style.display = hiddenIds.length > 0 ? 'block' : 'none';
    }
    
    // Filter out hidden products
    const visibleItems = allItems.filter(item => !hiddenIds.includes(item.id));
    
    productGrid.innerHTML = visibleItems.map(product => {
        const isCustom = customIds.includes(product.id);
        const badge = isCustom ? '<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">Custom</span>' : '';
        
        return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h4>${product.name}${badge}</h4>
                <div class="product-price">${product.price}</div>
                <p class="product-description">${product.description}</p>
                <button class="btn-delete" data-id="${product.id}">Delete</button>
            </div>
        </div>
        `;
    }).join('');
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete[data-id]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteProduct(id);
        });
    });
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Check if it's a custom product
        const customProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
        const customServices = JSON.parse(localStorage.getItem('sellerServices') || '[]');
        
        const isCustomProduct = customProducts.some(p => p.id === id);
        const isCustomService = customServices.some(s => s.id === id);
        
        if (isCustomProduct || isCustomService) {
            // Permanently delete custom products
            const updatedCustomProducts = customProducts.filter(p => p.id !== id);
            localStorage.setItem('sellerProducts', JSON.stringify(updatedCustomProducts));
            
            const updatedCustomServices = customServices.filter(s => s.id !== id);
            localStorage.setItem('sellerServices', JSON.stringify(updatedCustomServices));
        } else {
            // Hide original products (can't delete from JSON)
            const hiddenIds = JSON.parse(localStorage.getItem('hiddenProducts') || '[]');
            if (!hiddenIds.includes(id)) {
                hiddenIds.push(id);
                localStorage.setItem('hiddenProducts', JSON.stringify(hiddenIds));
            }
        }
        
        // Reload all products
        loadProducts();
    }
}

function renderWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (wishlistData.length === 0) {
        wishlistItems.innerHTML = '<p style="text-align: center; color: #999;">No wishlist items yet.</p>';
        return;
    }

    wishlistItems.innerHTML = wishlistData.map(product => `
        <div class="wishlist-item">
            <img src="${product.image}" alt="${product.name}" class="wishlist-image">
            <div class="wishlist-info">
                <h4>${product.name}</h4>
                <div class="wishlist-user">Price: ${product.price}</div>
                <div class="wishlist-date">${product.description}</div>
            </div>
        </div>
    `).join('');
}

// Load products from products.json
async function loadProducts() {
    try {
        const response = await fetch('/data/products.json');
        const data = await response.json();
        products = data.products || [];
        services = data.services || [];
        
        // Load custom products from localStorage
        const customProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
        const customServices = JSON.parse(localStorage.getItem('sellerServices') || '[]');
        
        // Combine original + custom items
        products = [...products, ...customProducts];
        services = [...services, ...customServices];
        allItems = [...products, ...services];
        
        renderProducts();
        // Load wishlist after products are loaded
        loadWishlist();
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
        services = [];
        allItems = [];
        renderProducts();
        loadWishlist();
    }
}

// Load wishlist from localStorage
function loadWishlist() {
    try {
        // Get wishlist IDs from localStorage
        const wishlistIds = localStorage.getItem('doodlein_wishlist');
        if (!wishlistIds) {
            wishlistData = [];
            renderWishlist();
            return;
        }

        // Parse the IDs
        const ids = JSON.parse(wishlistIds);
        
        // Map IDs to actual product/service data from allItems
        wishlistData = ids.map(id => {
            // Find item by ID (converting to number for comparison)
            const item = allItems.find(p => p.id == id || p.legacyId == id);
            return item;
        }).filter(p => p !== undefined); // Remove any undefined items
        
        renderWishlist();
    } catch (error) {
        console.error('Error loading wishlist:', error);
        wishlistData = [];
        renderWishlist();
    }
}
