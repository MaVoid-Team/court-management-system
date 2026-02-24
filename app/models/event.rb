class Event < ApplicationRecord
  belongs_to :branch
  has_many :event_bookings, dependent: :destroy

  validates :title, presence: true
  validates :start_date, presence: true
  validates :participation_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :max_participants, presence: true, numericality: { greater_than: 0 }

  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :upcoming, -> { where("start_date >= ?", Time.current) }

  def confirmed_bookings_count
    event_bookings.confirmed.count
  end

  def remaining_spots
    max_participants - confirmed_bookings_count
  end

  def whatsapp_redirect_link
    setting = branch.setting
    return nil unless setting&.whatsapp_number.present?

    encoded_text = ERB::Util.url_encode("I want to join #{title}")
    "https://wa.me/#{setting.whatsapp_number}?text=#{encoded_text}"
  end
end
