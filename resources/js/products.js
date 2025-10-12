// resources/js/products.js
// Fetch products.json and render slider cards dynamically

async function fetchData() {
    // Try API endpoints first (server-backed SQLite). If unavailable, fall back
    // to the legacy static JSON files in /data for backward compatibility.
    try {
        const apiProducts = fetch('/api/products')
        const apiServices = fetch('/api/services')
        const [productsRes, servicesRes] = await Promise.all([apiProducts, apiServices])

        if (productsRes.ok && servicesRes.ok) {
            const [productsData, servicesData] = await Promise.all([productsRes.json(), servicesRes.json()])
            // Expecting shape: { products: [...], services: [...] }
            return {
                products: productsData.products || productsData || [],
                services: servicesData.services || servicesData || []
            }
        }

        // If API responded but non-ok, fall through to legacy fallback
        console.warn('API endpoints returned non-ok status, falling back to static JSON')
    } catch (err) {
        // network error or endpoint not found — fall back to static JSON
        console.warn('API fetch failed, falling back to static JSON:', err)
    }

    // Legacy fallback
    try {
        const [productsRes, servicesRes] = await Promise.all([
            fetch('/data/products.json'),
            fetch('/data/services.json')
        ])
        if (!productsRes.ok || !servicesRes.ok) throw new Error('Failed to load legacy products or services')
        const [productsData, servicesData] = await Promise.all([productsRes.json(), servicesRes.json()])
        return {
            products: productsData.products || [],
            services: servicesData.services || []
        }
    } catch (err) {
        console.error('Failed to load any product/service data:', err)
        return { products: [], services: [] }
    }
}

function createCard(item) {
    const card = document.createElement('div')
    card.className = 'slider-card'
    card.dataset.id = String(item.id)

    const img = document.createElement('img')
    img.src = item.image
    img.alt = item.name

    const desc = document.createElement('div')
    desc.className = 'product-desc'

    const h2 = document.createElement('h2')
    h2.textContent = item.name

    const p = document.createElement('p')
    p.textContent = item.description

    const price = document.createElement('h2')
    price.className = 'product-price'
    price.textContent = item.price

    const a = document.createElement('a')
    a.href = '/orders'
    a.className = 'card-order-button'
    a.textContent = 'Order Now'

    // Wishlist button
    const wishlistBtn = document.createElement('button')
    // reuse order button styling so it matches visually
    wishlistBtn.className = 'card-order-button card-wishlist-button'
    wishlistBtn.type = 'button'
    wishlistBtn.dataset.id = String(item.id)
    wishlistBtn.textContent = isWishlisted(item.id) ? 'Remove' : 'Wishlist'
    wishlistBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('Wishlist button clicked for item:', item.id)
        await toggleWishlist(item.id)
    })

    desc.appendChild(h2)
    desc.appendChild(p)

    // controls row: price + wishlist/remove
    const controls = document.createElement('div')
    controls.className = 'card-controls'
    controls.appendChild(price)
    // ensure wishlist button uses separate class for styling
    wishlistBtn.classList.add('card-wishlist-button')
    controls.appendChild(wishlistBtn)

    desc.appendChild(controls)

    card.appendChild(img)
    card.appendChild(desc)
    // card.appendChild(a)

    return card
}

function borderServiceCards() {
    const card = document.createElement('div')
    card.className = 'first-service'
    return card
}

async function renderProducts() {
    // Load wishlist first before rendering
    await loadWishlist()
    
    const data = await fetchData()
    
    const productTrack = document.querySelector('#product .slider-track')
    const serviceTrack = document.querySelector('#service .slider-track')
    // If neither track exists, nothing to render
    if (!productTrack && !serviceTrack) return

    if (productTrack) {
        productTrack.innerHTML = ''
        data.products.forEach((p) => {
            // normalize image path from resources/images/... to /images/...
            if (p.image && p.image.startsWith('resources/images/')) {
                p.image = p.image.replace(/^resources\/images\//, '/images/')
            }
            productTrack.appendChild(createCard(p))
        })
    }

    if (serviceTrack) {
        serviceTrack.innerHTML = ''
        data.services.forEach((s) => {
            if (s.image && s.image.startsWith('resources/images/')) {
                s.image = s.image.replace(/^resources\/images\//, '/images/')
            }
            serviceTrack.appendChild(createCard(s))
        })
        serviceTrack.appendChild(borderServiceCards())
    }

    // Notify other scripts (slider) that products have been rendered
    document.dispatchEvent(new CustomEvent('products:rendered'))
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts()
})

document.addEventListener('wishlist:changed', () => {
    try { updateWishlistBadge() } catch (e) { /* ignore */ }
})

// ------------------ Wishlist logic (database-backed API) ------------------
// Cache wishlist in memory to avoid repeated API calls
let wishlistCache = null

async function loadWishlist() {
    try {
        const res = await fetch('/api/wishlist')
        if (!res.ok) throw new Error('Failed to fetch wishlist')
        const data = await res.json()
        // data.wishlist is array of { id, itemId, itemType }
        wishlistCache = data.wishlist || []
        return wishlistCache
    } catch (err) {
        console.error('Failed to load wishlist:', err)
        wishlistCache = []
        return []
    }
}

function getWishlist() {
    // Return cached wishlist (array of { id, itemId, itemType })
    return wishlistCache || []
}

function isWishlisted(itemId) {
    const list = getWishlist()
    return list.some(w => String(w.itemId) === String(itemId))
}

async function addToWishlist(itemId, itemType) {
    try {
        console.log('POST /api/wishlist with:', { itemId: String(itemId), itemType })
        const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: String(itemId), itemType })
        })
        const responseData = await res.json()
        console.log('API response:', responseData)
        if (!res.ok) throw new Error('Failed to add to wishlist')
        await loadWishlist() // refresh cache
        return true
    } catch (err) {
        console.error('Failed to add to wishlist:', err)
        return false
    }
}

async function removeFromWishlist(itemId, itemType) {
    try {
        console.log('DELETE /api/wishlist/item with:', { itemId, itemType })
        const res = await fetch(`/api/wishlist/item/${itemId}/${itemType}`, {
            method: 'DELETE'
        })
        const responseData = await res.json()
        console.log('API response:', responseData)
        if (!res.ok) throw new Error('Failed to remove from wishlist')
        await loadWishlist() // refresh cache
        return true
    } catch (err) {
        console.error('Failed to remove from wishlist:', err)
        return false
    }
}

async function toggleWishlist(itemId) {
    const sid = String(itemId)
    const inWishlist = isWishlisted(sid)
    
    console.log('toggleWishlist called:', { itemId: sid, inWishlist })
    
    // Determine itemType (product or service) from current data
    const data = await fetchData()
    let itemType = 'product'
    const foundService = (data.services || []).find(s => String(s.id) === sid)
    if (foundService) itemType = 'service'

    console.log('Item type determined:', itemType)

    let success = false
    if (inWishlist) {
        console.log('Removing from wishlist...')
        success = await removeFromWishlist(sid, itemType)
    } else {
        console.log('Adding to wishlist...')
        success = await addToWishlist(sid, itemType)
    }

    console.log('Operation success:', success)

    if (success) {
        // update UI: find all matching buttons and update text by data-id
        document.querySelectorAll('.card-wishlist-button').forEach(btn => {
            if (btn.dataset.id == sid) {
                const nowWishlisted = isWishlisted(sid)
                btn.textContent = nowWishlisted ? 'Remove' : 'Wishlist'
                if (btn.style) {
                    btn.style.background = nowWishlisted ? '#f44336' : '#4CAF50'
                }
            }
        })

        // notify others (header badge) that wishlist changed
        const count = getWishlist().length
        document.dispatchEvent(new CustomEvent('wishlist:changed', { detail: { count } }))
    }
}

// Update the small badge element in header showing wishlist count
function updateWishlistBadge() {
    const badge = document.querySelector('.wishlist-badge')
    if (!badge) return
    const count = getWishlist().length || 0
    badge.textContent = String(count)
    if (count === 0) {
        badge.style.opacity = '0.9'
    } else {
        badge.style.opacity = '1'
    }
}

// Expose for other scripts and initialize on load
window.updateWishlistBadge = updateWishlistBadge
window.getWishlist = getWishlist
window.isWishlisted = isWishlisted
window.toggleWishlist = toggleWishlist
window.loadWishlist = loadWishlist

// Initialize wishlist cache on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadWishlist()
    updateWishlistBadge()
})

// Helper function to create search result card with product-card style
function createSearchCard(item) {
    const card = document.createElement('div')
    card.className = 'product-card'
    card.dataset.id = String(item.id)

    const img = document.createElement('img')
    img.src = item.image
    img.alt = item.name
    img.className = 'product-image'

    const productInfo = document.createElement('div')
    productInfo.className = 'product-info'

    const h4 = document.createElement('h4')
    h4.textContent = item.name

    const priceDiv = document.createElement('div')
    priceDiv.className = 'product-price'
    priceDiv.textContent = item.price

    const p = document.createElement('p')
    p.className = 'product-description'
    p.textContent = item.description

    // Wishlist button
    const wishlistBtn = document.createElement('button')
    wishlistBtn.className = 'btn-delete card-wishlist-button'
    wishlistBtn.type = 'button'
    wishlistBtn.dataset.id = String(item.id)
    
    // Function to update button state
    const updateButtonState = () => {
        const inWishlist = isWishlisted(item.id)
        wishlistBtn.textContent = inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'
        wishlistBtn.style.background = inWishlist ? '#f44336' : '#4CAF50'
    }
    
    // Set initial state
    updateButtonState()
    
    // Handle click with async toggle
    wishlistBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        wishlistBtn.disabled = true
        wishlistBtn.textContent = 'Processing...'
        
        try {
            await toggleWishlist(item.id)
            updateButtonState()
        } catch (error) {
            console.error('Failed to toggle wishlist:', error)
            alert('Failed to update wishlist')
        } finally {
            wishlistBtn.disabled = false
        }
    })

    productInfo.appendChild(h4)
    productInfo.appendChild(priceDiv)
    productInfo.appendChild(p)
    productInfo.appendChild(wishlistBtn)

    card.appendChild(img)
    card.appendChild(productInfo)

    return card
}

// Provide renderSearchResults from products.js so search page can call it early
window.renderSearchResults = async function (container, query) {
    if (!container) return
    container.innerHTML = '<p>Loading...</p>'
    
    // IMPORTANT: Load wishlist first before rendering cards
    await loadWishlist()
    
    const q = (query || '').trim().toLowerCase()
    if (!q) {
        container.innerHTML = '<p>Please enter a search query.</p>'
        return
    }

    const data = await fetchData()
    const items = []
    ;(data.products || []).forEach(p => items.push(p))
    ;(data.services || []).forEach(s => items.push(s))

    const matches = items.filter(it => (it.name || '').toLowerCase().includes(q))
    if (matches.length === 0) {
        container.innerHTML = '<p>No results found.</p>'
        return
    }

    container.innerHTML = ''
    const grid = document.createElement('div')
    grid.className = 'product-grid'

    matches.forEach(item => {
        const card = createSearchCard(item)
        grid.appendChild(card)
    })

    container.appendChild(grid)
}

// Helper to render wishlist page client-side
async function renderWishlistPage(container) {
    if (!container) return
    container.innerHTML = '<p>Loading wishlist...</p>'
    
    // Load wishlist from API
    await loadWishlist()
    const wishlistItems = getWishlist()
    
    if (wishlistItems.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty.</p>'
        return
    }
    
    // Fetch all products/services to match wishlist items
    const data = await fetchData()
    const allProducts = []
    ;(data.products || []).forEach(p => allProducts.push(p))
    ;(data.services || []).forEach(s => allProducts.push(s))

    container.innerHTML = ''
    
    // Render each wishlisted item
    wishlistItems.forEach(w => {
        const item = allProducts.find(p => String(p.id) === String(w.itemId))
        if (item) {
            const card = createCard(item)
            container.appendChild(card)
        }
    })
}

// expose renderWishlistPage to window so wishlist page can call it
window.renderWishlistPage = renderWishlistPage
