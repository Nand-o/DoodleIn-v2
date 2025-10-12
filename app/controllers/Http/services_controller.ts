import Service from '#models/service'

export default class ServicesController {
  public async index({ response }: any) {
    const services = await Service.query().orderBy('id', 'asc')

    const payload = services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      image: s.imageUrl,
      legacyId: (s as any).legacyId || undefined,
    }))

    return response.ok({ services: payload })
  }

  /**
   * POST /api/services - Create a new service
   */
  public async store({ request, response }: any) {
    try {
      const { name, description, price, image } = request.only([
        'name',
        'description',
        'price',
        'image',
      ])

      if (!name || !price) {
        return response.status(400).json({ error: 'Name and price are required' })
      }

      const service = await Service.create({
        name,
        description: description || '',
        price,
        imageUrl: image || 'https://via.placeholder.com/250x200/9C27B0/white?text=New+Service',
      })

      return response.status(201).json({
        message: 'Service created successfully',
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          image: service.imageUrl,
        },
      })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to create service' })
    }
  }

  /**
   * DELETE /api/services/:id - Delete a service from database
   */
  public async destroy({ params, response }: any) {
    try {
      const service = await Service.find(params.id)

      if (!service) {
        return response.status(404).json({ error: 'Service not found' })
      }

      await service.delete()
      return response.json({ message: 'Service deleted successfully' })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to delete service' })
    }
  }
}
