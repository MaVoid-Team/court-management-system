class Branch < ApplicationRecord
  has_many :admins, dependent: :destroy
  has_many :courts, dependent: :destroy
  has_many :packages, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :blocked_slots, dependent: :destroy
  has_one :setting, dependent: :destroy

  validates :name, presence: true
  validates :timezone, presence: true

  scope :active, -> { where(active: true) }
end
