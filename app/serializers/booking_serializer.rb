class BookingSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :court_id, :user_name, :user_phone,
             :date, :start_time, :end_time, :hours, :total_price,
             :status, :payment_status, :created_at, :updated_at

  attribute :start_time do |booking|
    booking.start_time&.strftime("%H:%M")
  end

  attribute :end_time do |booking|
    booking.end_time&.strftime("%H:%M")
  end
end
