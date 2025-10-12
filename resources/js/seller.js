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
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    // Image preview
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });

    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const itemType = document.getElementById('itemType').value
        const name = document.getElementById('productName').value
        const price = parseFloat(document.getElementById('productPrice').value)
        const description = document.getElementById('productDescription').value
        const imageFile = imageInput.files[0]

        if (!itemType) {
            alert('Please select item type (Product or Service)')
            return
        }

        if (!imageFile) {
            alert('Please upload an image')
            return
        }

        try {
            console.log('Uploading image...')

            // Step 1: Upload image first
            const formData = new FormData()
            formData.append('image', imageFile)

            const uploadResponse = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json()
                throw new Error(error.error || 'Failed to upload image')
            }

            const { path: imagePath } = await uploadResponse.json()
            console.log('Image uploaded:', imagePath)

            // Step 2: Create product/service with the uploaded image path
            const endpoint = itemType === 'product' ? '/api/products' : '/api/services'
            console.log(`Creating ${itemType}:`, { name, price, description, image: imagePath })

            const createResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, description, image: imagePath })
            })

            if (!createResponse.ok) {
                const error = await createResponse.json()
                throw new Error(error.error || `Failed to create ${itemType}`)
            }

            const result = await createResponse.json()
            console.log(`${itemType} created:`, result)

            // Reload all products to show the new one
            await loadProducts()
            
            addProductForm.reset()
            imagePreview.style.display = 'none'
            
            const successMsg = document.getElementById('successMessage')
            successMsg.textContent = `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} added to database successfully!`
            successMsg.classList.add('show')
            setTimeout(() => successMsg.classList.remove('show'), 3000)
        } catch (error) {
            console.error('Error creating item:', error)
            alert(`Failed to add item: ${error.message}`)
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
    
    productGrid.innerHTML = allItems.map(product => {
        return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h4>${product.name}</h4>
                <div class="product-price">$${product.price}</div>
                <p class="product-description">${product.description}</p>
                <button class="btn-delete" data-id="${product.id}">Delete from Database</button>
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

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This will PERMANENTLY remove it from the database.')) {
        return
    }

    try {
        // Determine if it's a product or service by checking allItems
        const item = allItems.find(i => i.id === id)
        if (!item) {
            alert('Item not found!')
            return
        }

        // Determine item type from original arrays
        const isProduct = products.some(p => p.id === id)
        const itemType = isProduct ? 'product' : 'service'
        const endpoint = isProduct ? '/api/products' : '/api/services'

        console.log(`Deleting ${itemType} with ID: ${id}`)

        // Call DELETE API
        const response = await fetch(`${endpoint}/${id}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to delete item')
        }

        const result = await response.json()
        console.log('Delete response:', result)

        // Show success message
        alert('Item deleted successfully from database!')

        // Reload products to refresh the list
        await loadProducts()
    } catch (error) {
        console.error('Error deleting product:', error)
        alert(`Failed to delete item: ${error.message}`)
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
                <div class="wishlist-user">Price: $${product.price}</div>
                <div class="wishlist-date">${product.description}</div>
            </div>
        </div>
    `).join('');
}

// Load products from API (SQLite) with fallback to static JSON
async function loadProducts() {
    try {
        let productsData = []
        let servicesData = []

        // Fetch from API endpoints
        try {
            const [pRes, sRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/services')
            ])
            if (pRes.ok && sRes.ok) {
                const [pJson, sJson] = await Promise.all([pRes.json(), sRes.json()])
                productsData = pJson.products || pJson || []
                servicesData = sJson.services || sJson || []
            } else {
                console.error('API returned non-ok status')
                productsData = []
                servicesData = []
            }
        } catch (e) {
            console.error('Failed to fetch from API:', e)
            productsData = []
            servicesData = []
        }

        // assign
        products = productsData || []
        services = servicesData || []
        allItems = [...products, ...services]

        renderProducts()
        // Load wishlist after products are loaded
        await loadWishlist()
    } catch (error) {
        console.error('Error loading products:', error)
        products = []
        services = []
        allItems = []
        renderProducts()
        loadWishlist()
    }
}

// Load wishlist from database API
async function loadWishlist() {
    try {
        // Fetch wishlist from API
        const res = await fetch('/api/wishlist')
        if (!res.ok) throw new Error('Failed to fetch wishlist')
        
        const data = await res.json()
        const wishlistItems = data.wishlist || []
        
        // Map wishlist items to actual product/service data
        wishlistData = wishlistItems.map(w => {
            // Find item by itemId from allItems
            const item = allItems.find(p => String(p.id) === String(w.itemId))
            return item
        }).filter(p => p !== undefined) // Remove any undefined items
        
        renderWishlist()
    } catch (error) {
        console.error('Error loading wishlist:', error)
        wishlistData = []
        renderWishlist()
    }
}
