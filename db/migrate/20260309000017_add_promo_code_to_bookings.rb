class AddPromoCodeToBookings < ActiveRecord::Migration[7.0]
  def change
    add_reference :bookings, :promo_code, null: true, foreign_key: true
    add_column :bookings, :original_price, :decimal, precision: 8, scale: 2
    add_column :bookings, :discount_amount, :decimal, precision: 8, scale: 2, default: 0
    add_index :bookings, :promo_code_id
  end
end
