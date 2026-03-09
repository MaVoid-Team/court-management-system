class Court < ApplicationRecord
  include MeiliSearch::Rails

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :name, :branch_id, :active
    searchable_attributes [:name]
    filterable_attributes [:branch_id, :active]
  end

  belongs_to :branch
  has_many :bookings, dependent: :destroy
  has_many :blocked_slots, dependent: :destroy
  has_many :perks, dependent: :destroy
  has_many :hourly_rates, class_name: "CourtHourlyRate", dependent: :destroy

  validates :name, presence: true
  validates :price_per_hour, presence: true, numericality: { greater_than: 0 }

  scope :active, -> { where(active: true) }
  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :active_filter, ->(val) { val.present? ? where(active: ActiveModel::Type::Boolean.new.cast(val)) : all }

  def price_for_hour(hour)
    range = hourly_rates.active.find_by("start_hour <= ? AND end_hour > ?", hour, hour)
    range&.price_per_hour || price_per_hour
  end

  def calculate_price_for_period(start_time, end_time)
    total = BigDecimal("0")
    cursor = start_time

    while cursor < end_time
      total += BigDecimal(price_for_hour(cursor.hour).to_s)
      cursor += 1.hour
    end

    total
  end
end
