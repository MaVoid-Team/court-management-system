module Api
  class EventsController < BaseController
    def index
      events = Event.includes(branch: :setting)

      events = events.for_branch(params[:branch_id]) if params[:branch_id].present?
      events = events.upcoming if params[:upcoming].present?

      render json: EventSerializer.new(paginate(events)).serializable_hash, status: :ok
    end

    def show
      event = Event.includes(branch: :setting).find(params[:id])
      render json: EventSerializer.new(event).serializable_hash, status: :ok
    end
  end
end
