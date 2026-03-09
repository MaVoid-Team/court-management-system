class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.references :booking, null: false, foreign_key: true
      t.references :court,   null: false, foreign_key: true
      t.references :branch,  null: false, foreign_key: true

      t.string  :reviewer_name, null: false
      t.integer :rating,        null: false
      t.text    :body

      t.timestamps
    end

    add_index :reviews, :booking_id, unique: true
    add_index :reviews, [:court_id, :rating]
    add_index :reviews, [:branch_id, :rating]
  end
end
