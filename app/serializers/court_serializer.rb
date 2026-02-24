class CourtSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :name, :price_per_hour, :active, :created_at, :updated_at
end
