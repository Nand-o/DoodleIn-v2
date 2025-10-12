import type { HttpContext } from '@adonisjs/core/http'
import Wishlist from '#models/wishlist'

export default class WishlistsController {
  /**
   * GET /api/wishlist - Get all wishlist items
   */
  async index({ response }: HttpContext) {
    try {
      const items = await Wishlist.all()
      const wishlist = items.map((item) => ({
        id: item.id,
        itemId: item.itemId,
        itemType: item.itemType,
      }))
      return response.json({ wishlist })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch wishlist' })
    }
  }

  /**
   * POST /api/wishlist - Add item to wishlist
   * Body: { itemId: string, itemType: 'product' | 'service' }
   */
  async store({ request, response }: HttpContext) {
    try {
      const { itemId, itemType } = request.only(['itemId', 'itemType'])

      if (!itemId || !itemType) {
        return response.status(400).json({ error: 'itemId and itemType are required' })
      }

      // Check if already exists
      const existing = await Wishlist.query()
        .where('item_id', itemId)
        .where('item_type', itemType)
        .first()

      if (existing) {
        return response.json({ message: 'Already in wishlist', wishlist: existing })
      }

      const wishlist = await Wishlist.create({
        itemId,
        itemType,
      })

      return response.status(201).json({
        message: 'Added to wishlist',
        wishlist: {
          id: wishlist.id,
          itemId: wishlist.itemId,
          itemType: wishlist.itemType,
        },
      })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to add to wishlist' })
    }
  }

  /**
   * DELETE /api/wishlist/:id - Remove item from wishlist by ID
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const { id } = params
      const wishlist = await Wishlist.find(id)

      if (!wishlist) {
        return response.status(404).json({ error: 'Wishlist item not found' })
      }

      await wishlist.delete()
      return response.json({ message: 'Removed from wishlist' })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to remove from wishlist' })
    }
  }

  /**
   * DELETE /api/wishlist/item/:itemId/:itemType - Remove by itemId and itemType
   */
  async destroyByItem({ params, response }: HttpContext) {
    try {
      const { itemId, itemType } = params
      const wishlist = await Wishlist.query()
        .where('item_id', itemId)
        .where('item_type', itemType)
        .first()

      if (!wishlist) {
        return response.status(404).json({ error: 'Wishlist item not found' })
      }

      await wishlist.delete()
      return response.json({ message: 'Removed from wishlist' })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to remove from wishlist' })
    }
  }
}
