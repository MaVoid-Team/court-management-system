module Api
  module Admin
    class EventsController < BaseController
      def index
        events = policy_scope(Event).includes(:event_bookings)
        events = events.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        render json: EventSerializer.new(paginate(events)).serializable_hash, status: :ok
      end

      def show
        event = Event.find(params[:id])
        authorize event
        render json: EventSerializer.new(event).serializable_hash, status: :ok
      end

      def create
        event = Event.new(event_params)
        authorize event
        event.save!
        render json: EventSerializer.new(event).serializable_hash, status: :created
      end

      def update
        event = Event.find(params[:id])
        authorize event
        event.update!(event_params)
        render json: EventSerializer.new(event).serializable_hash, status: :ok
      end

      def destroy
        event = Event.find(params[:id])
        authorize event
        event.destroy!
        head :no_content
      end

      private

      def event_params
        params.require(:event).permit(
          :branch_id, :title, :description,
          :start_date, :participation_price, :max_participants
        )
      end
    end
  end
end
