class Court < ApplicationRecord
  belongs_to :branch
  has_many :bookings, dependent: :destroy
  has_many :blocked_slots, dependent: :destroy

  validates :name, presence: true
  validates :price_per_hour, presence: true, numericality: { greater_than: 0 }

  scope :active, -> { where(active: true) }
  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
end
