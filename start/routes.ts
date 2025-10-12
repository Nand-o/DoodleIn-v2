/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home')
router.on('/about').render('pages/about')
router.on('/products').render('pages/products')
router.on('/search').render('pages/search')
router.on('/orders').render('pages/orders')
router.on('/contact').render('pages/contact')
router.on('/wishlist').render('pages/wishlist')
router.on('/seller').render('pages/seller')

// API routes for client-side to fetch data from database-backed endpoints
import Product from '#models/product'
import Service from '#models/service'
const WishlistsController = () => import('#controllers/Http/wishlists_controller')
const ProductsController = () => import('#controllers/Http/products_controller')
const ServicesController = () => import('#controllers/Http/services_controller')

router.get('/api/products', async ({ response }) => {
  const products = await Product.query().orderBy('id', 'asc')
  const payload = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.imageUrl,
  }))
  return response.ok({ products: payload })
})

router.get('/api/services', async ({ response }) => {
  const services = await Service.query().orderBy('id', 'asc')
  const payload = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    image: s.imageUrl,
  }))
  return response.ok({ services: payload })
})

// Product and Service CRUD routes
router.post('/api/products', [ProductsController, 'store'])
router.post('/api/services', [ServicesController, 'store'])
router.delete('/api/products/:id', [ProductsController, 'destroy'])
router.delete('/api/services/:id', [ServicesController, 'destroy'])

// Image upload endpoint
router.post('/api/upload-image', async ({ request, response }) => {
  try {
    const image = request.file('image', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    })

    if (!image) {
      return response.status(400).json({ error: 'No image file provided' })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${image.clientName}`

    // Move file to public/images/products/
    await image.move('public/images/products', {
      name: filename,
      overwrite: true,
    })

    // Return the public URL path
    const imagePath = `/images/products/${filename}`
    return response.json({ path: imagePath, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return response.status(500).json({ error: 'Failed to upload image' })
  }
})

// Wishlist API routes
router.get('/api/wishlist', [WishlistsController, 'index'])
router.post('/api/wishlist', [WishlistsController, 'store'])
router.delete('/api/wishlist/:id', [WishlistsController, 'destroy'])
router.delete('/api/wishlist/item/:itemId/:itemType', [WishlistsController, 'destroyByItem'])
