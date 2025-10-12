import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: [
        'resources/css/app.css',
        'resources/css/main.css',
        'resources/css/about.css',
        'resources/css/contact.css',
        'resources/css/order.css',
        'resources/css/product.css',
        'resources/css/search.css',
        'resources/css/seller.css',
        'resources/css/wishlist.css',
        'resources/js/app.js',
        'resources/js/main.js',
        'resources/js/about.js',
        'resources/js/order.js',
        'resources/js/products.js',
        'resources/js/productSlider.js',
        'resources/js/search.js',
        'resources/js/seller.js',
      ],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],
})
