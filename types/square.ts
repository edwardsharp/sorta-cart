export interface InventoryCountUpdatedWebhook {
  merchant_id: string
  type: string
  event_id: string
  created_at: string
  data: Data
}
interface Data {
  type: string
  id: string
  object: Object
}
interface Object {
  inventory_counts?: InventoryCountsEntity[] | null
}
interface InventoryCountsEntity {
  calculated_at: string
  catalog_object_id: string
  catalog_object_type: string
  location_id: string
  quantity: string
  state: string
}
