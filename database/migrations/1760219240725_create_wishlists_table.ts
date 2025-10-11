import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wishlists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // auto-increment primary key
      table.increments('id').primary()

      // store the referenced item id and type (product | service)
      // This matches the client-side wishlist which stores an array of item IDs
      // and lets the UI map them to either products or services.
      table.integer('item_id').notNullable()
      table.string('item_type').notNullable()

      // timestamps
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
