class Booking < ApplicationRecord
  belongs_to :branch
  belongs_to :court
  has_many :payments, dependent: :destroy

  enum :status, { confirmed: 0, cancelled: 1 }
  enum :payment_status, { pending: 0, paid: 1, failed: 2 }

  validates :user_name, presence: true
  validates :user_phone, presence: true
  validates :date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :hours, presence: true, numericality: { greater_than: 0 }
  validates :total_price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :for_court, ->(court_id) { where(court_id: court_id) }
  scope :on_date, ->(date) { where(date: date) }
  scope :active, -> { where(status: :confirmed) }

  def self.overlapping(court_id, date, start_time, end_time)
    where(court_id: court_id, date: date, status: :confirmed)
      .where("start_time < ? AND end_time > ?", end_time, start_time)
  end
end
