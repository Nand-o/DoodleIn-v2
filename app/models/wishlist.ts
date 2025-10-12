import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Wishlist extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'item_id' })
  declare itemId: string

  @column({ columnName: 'item_type' })
  declare itemType: string // 'product' or 'service'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
