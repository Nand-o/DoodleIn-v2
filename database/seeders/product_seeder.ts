import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import fs from 'node:fs/promises'
import path from 'node:path'

export default class extends BaseSeeder {
  async run() {
    // Read JSON file from database/seeds/data
    const jsonPath = path.join(process.cwd(), 'database', 'seeds', 'data', 'products.json')
    const raw = await fs.readFile(jsonPath, 'utf8')
    const productsData = JSON.parse(raw)

    const products = (productsData.products as any[]).map((product: any) => {
      // product.price in JSON includes a leading '$' (e.g. "$20").
      // Strip non-numeric characters before parsing.
      const cleaned = String(product.price).replace(/[^0-9.]/g, '')

      // Normalize image path: resources/images/products/... → /images/static/products/...
      let imagePath = product.image
      if (imagePath && imagePath.startsWith('resources/images/')) {
        imagePath = imagePath.replace(/^resources\/images\//, '/images/static/')
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number.parseFloat(cleaned) || 0,
        imageUrl: imagePath,
      }
    })

    for (const p of products) {
      const existing = await Product.find(p.id)
      if (!existing) {
        await Product.create(p)
      }
    }
  }
}
