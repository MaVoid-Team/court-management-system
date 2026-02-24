class Package < ApplicationRecord
  belongs_to :branch, optional: true

  validates :title, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :for_branch, ->(branch_id) { where(branch_id: [branch_id, nil]) }
end
