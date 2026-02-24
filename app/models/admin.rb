class Admin < ApplicationRecord
  has_secure_password

  belongs_to :branch, optional: true

  enum :role, { super_admin: 0, branch_admin: 1 }

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true
  validates :branch, presence: true, if: :branch_admin?
end
