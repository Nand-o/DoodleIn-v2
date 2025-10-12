import Product from '#models/product'

export default class ProductsController {
  public async index({ response }: any) {
    const products = await Product.query().orderBy('id', 'asc')

    // map to API shape expected by client
    const payload = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.imageUrl,
      legacyId: (p as any).legacyId || undefined,
    }))

    return response.ok({ products: payload })
  }

  /**
   * POST /api/products - Create a new product
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

      const product = await Product.create({
        name,
        description: description || '',
        price,
        imageUrl: image || 'https://via.placeholder.com/250x200/9C27B0/white?text=New+Product',
      })

      return response.status(201).json({
        message: 'Product created successfully',
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.imageUrl,
        },
      })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to create product' })
    }
  }

  /**
   * DELETE /api/products/:id - Delete a product from database
   */
  public async destroy({ params, response }: any) {
    try {
      const product = await Product.find(params.id)
      
      if (!product) {
        return response.status(404).json({ error: 'Product not found' })
      }

      await product.delete()
      return response.json({ message: 'Product deleted successfully' })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to delete product' })
    }
  }
}
