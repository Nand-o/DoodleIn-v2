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
    price.textContent = item.price

    const a = document.createElement('a')
    a.href = '/orders'
    a.className = 'card-order-button'
    a.textContent = 'Order Now'

    desc.appendChild(h2)
    desc.appendChild(p)
    desc.appendChild(price)

    card.appendChild(img)
    card.appendChild(desc)
    card.appendChild(a)

    return card
}

function borderServiceCards() {
    const card = document.createElement('div')
    card.className = 'first-service'
    return card
}

async function renderProducts() {
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
