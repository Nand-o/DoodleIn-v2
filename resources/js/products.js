// resources/js/products.js
// Fetch products.json and render slider cards dynamically

async function fetchData() {
    try {
        const res = await fetch('/data/products.json')
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        return data
    } catch (err) {
        console.error(err)
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
    wishlistBtn.addEventListener('click', () => toggleWishlist(item.id))

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
    const data = await fetchData()
    // Migrate legacy wishlist ids (if any) to new ids using legacyId mapping
    try {
        const mapping = {}
        ;(data.products || []).forEach(p => { if (p.legacyId) mapping[String(p.legacyId)] = String(p.id) })
        ;(data.services || []).forEach(s => { if (s.legacyId) mapping[String(s.legacyId)] = String(s.id) })

        const raw = localStorage.getItem(WISHLIST_KEY)
        if (raw) {
            const arr = JSON.parse(raw)
            let changed = false
            // migrate legacy ids
            const migrated = arr.map(x => {
                const sx = String(x)
                if (mapping[sx]) { changed = true; return mapping[sx] }
                return sx
            })

            // validate against actual ids present in data
            const validIds = new Set()
            ;(data.products || []).forEach(p => validIds.add(String(p.id)))
            ;(data.services || []).forEach(s => validIds.add(String(s.id)))

            const validated = migrated.filter(id => validIds.has(String(id)))
            if (validated.length !== migrated.length) changed = true

            if (changed) saveWishlist(validated)
        }
    } catch (e) {
        console.warn('Wishlist migration failed', e)
    }
    const productTrack = document.querySelector('#product .slider-track')
    const serviceTrack = document.querySelector('#service .slider-track')
    // If neither track exists, nothing to render
    if (!productTrack && !serviceTrack) return

    if (productTrack) {
        productTrack.innerHTML = ''

        // load custom products from localStorage (sellerProducts)
        const customProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]')
        // build combined list: original products first then custom
        const combinedProducts = ([]).concat(data.products || [], customProducts)

        combinedProducts.forEach((p) => {
            // normalize image path from resources/images/... to /images/...
            if (p.image && p.image.startsWith('resources/images/')) {
                p.image = p.image.replace(/^resources\/images\//, '/images/')
            }
            productTrack.appendChild(createCard(p))
        })
    }

    if (serviceTrack) {
        serviceTrack.innerHTML = ''

        // load custom services from localStorage (sellerServices)
        const customServices = JSON.parse(localStorage.getItem('sellerServices') || '[]')
        const combinedServices = ([]).concat(data.services || [], customServices)

        combinedServices.forEach((s) => {
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

// initialize header badge when page is ready and listen for changes
document.addEventListener('DOMContentLoaded', () => {
    try { updateWishlistBadge() } catch (e) { /* ignore */ }
})
+
document.addEventListener('wishlist:changed', () => {
    try { updateWishlistBadge() } catch (e) { /* ignore */ }
})

// ------------------ Wishlist logic (localStorage) ------------------
const WISHLIST_KEY = 'doodlein_wishlist'

function getWishlist() {
    try {
        const raw = localStorage.getItem(WISHLIST_KEY)
        // normalize stored ids to strings for consistent comparisons
        const parsed = raw ? JSON.parse(raw) : []
        return parsed.map(id => String(id))
    } catch (err) {
        return []
    }
}

function saveWishlist(list) {
    // ensure we save strings only
    const normalized = list.map(id => String(id))
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(normalized))
}

function isWishlisted(id) {
    return getWishlist().includes(String(id))
}

function toggleWishlist(id) {
    const sid = String(id)
    const list = getWishlist()
    const idx = list.indexOf(sid)
    if (idx === -1) {
        list.push(sid)
    } else {
        list.splice(idx, 1)
    }
    saveWishlist(list)
    // update UI: find all matching buttons and update text by data-id
    document.querySelectorAll('.card-wishlist-button').forEach(btn => {
        if (btn.dataset.id == String(id)) {
            btn.textContent = isWishlisted(id) ? 'Remove' : 'Wishlist'
        }
    })

    // notify others (header badge) that wishlist changed
    document.dispatchEvent(new CustomEvent('wishlist:changed', { detail: { count: getWishlist().length } }))
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
    wishlistBtn.textContent = isWishlisted(item.id) ? 'Remove from Wishlist' : 'Add to Wishlist'
    wishlistBtn.style.background = isWishlisted(item.id) ? '#f44336' : '#4CAF50'
    wishlistBtn.addEventListener('click', () => {
        toggleWishlist(item.id)
        wishlistBtn.textContent = isWishlisted(item.id) ? 'Remove from Wishlist' : 'Add to Wishlist'
        wishlistBtn.style.background = isWishlisted(item.id) ? '#f44336' : '#4CAF50'
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
    container.innerHTML = ''
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

    const grid = document.createElement('div')
    grid.className = 'product-grid'

    matches.forEach(item => {
        const card = createSearchCard(item)
        grid.appendChild(card)
    })

    container.appendChild(grid)
}

// Helper to render wishlist page client-side
function renderWishlistPage(container) {
    const list = getWishlist()
    if (!container) return
    container.innerHTML = ''
    if (list.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty.</p>'
        return
    }
    // fetch products/services and render matching items
    fetchData().then(data => {
        const items = []
        ;(data.products || []).forEach(p => items.push(p))
        ;(data.services || []).forEach(s => items.push(s))

        items.forEach(item => {
            if (list.includes(String(item.id))) {
                const card = createCard(item)
                container.appendChild(card)
            }
        })
    })
}

// expose renderWishlistPage to window so wishlist page can call it
window.renderWishlistPage = renderWishlistPage
