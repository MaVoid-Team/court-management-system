class BookingSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :court_id, :user_name, :user_phone,
             :date, :start_time, :end_time, :hours, :total_price,
             :original_price, :discount_amount, :status, :payment_status, 
             :notes, :promo_code_id, :created_at, :updated_at

  has_one :promo_code

  attribute :start_time do |booking|
    booking.start_time&.strftime("%H:%M")
  end

  attribute :end_time do |booking|
    booking.end_time&.strftime("%H:%M")
  end

  attribute :booking_slots do |booking|
    booking.booking_slots.map do |slot|
      {
        start_time: slot.start_time.strftime("%H:%M"),
        end_time: slot.end_time.strftime("%H:%M")
      }
    end
  end
end
