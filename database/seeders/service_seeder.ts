import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Service from '#models/service'
import fs from 'node:fs/promises'
import path from 'node:path'

export default class extends BaseSeeder {
  async run() {
    // Read JSON file from database/seeds/data
    const jsonPath = path.join(process.cwd(), 'database', 'seeds', 'data', 'services.json')
    const raw = await fs.readFile(jsonPath, 'utf8')
    const servicesData = JSON.parse(raw)

    const services = (servicesData.services as any[]).map((service: any) => {
      // service.price may be a range like "$8-25". Use the lower bound.
      const rawPrice = String(service.price || '')
      const firstPart = rawPrice.split('-')[0]
      const cleaned = firstPart.replace(/[^0-9.]/g, '')

      // Normalize image path: resources/images/products/... → /images/static/products/...
      let imagePath = service.image
      if (imagePath && imagePath.startsWith('resources/images/')) {
        imagePath = imagePath.replace(/^resources\/images\//, '/images/static/')
      }

      return {
        id: service.id,
        name: service.name,
        description: service.description,
        price: Number.parseFloat(cleaned) || 0,
        imageUrl: imagePath,
      }
    })

    for (const s of services) {
      const existing = await Service.find(s.id)
      if (!existing) {
        await Service.create(s)
      }
    }
  }
}
