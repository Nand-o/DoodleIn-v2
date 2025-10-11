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
