module Api
  module Admin
    class BlockedSlotsController < BaseController
      def index
        blocked_slots = policy_scope(BlockedSlot).includes(:court)
        blocked_slots = blocked_slots.where(court_id: params[:court_id]) if params[:court_id].present?
        blocked_slots = blocked_slots.where(date: params[:date]) if params[:date].present?
        render json: BlockedSlotSerializer.new(paginate(blocked_slots)).serializable_hash, status: :ok
      end

      def show
        blocked_slot = BlockedSlot.find(params[:id])
        authorize blocked_slot
        render json: BlockedSlotSerializer.new(blocked_slot).serializable_hash, status: :ok
      end

      def create
        blocked_slot = BlockedSlot.new(blocked_slot_params)
        authorize blocked_slot
        blocked_slot.save!

        Availability::CacheInvalidator.new(
          branch_id: blocked_slot.branch_id,
          court_id: blocked_slot.court_id,
          date: blocked_slot.date
        ).call

        render json: BlockedSlotSerializer.new(blocked_slot).serializable_hash, status: :created
      end

      def update
        blocked_slot = BlockedSlot.find(params[:id])
        authorize blocked_slot
        blocked_slot.update!(blocked_slot_params)

        Availability::CacheInvalidator.new(
          branch_id: blocked_slot.branch_id,
          court_id: blocked_slot.court_id,
          date: blocked_slot.date
        ).call

        render json: BlockedSlotSerializer.new(blocked_slot).serializable_hash, status: :ok
      end

      def destroy
        blocked_slot = BlockedSlot.find(params[:id])
        authorize blocked_slot
        blocked_slot.destroy!

        Availability::CacheInvalidator.new(
          branch_id: blocked_slot.branch_id,
          court_id: blocked_slot.court_id,
          date: blocked_slot.date
        ).call

        head :no_content
      end

      private

      def blocked_slot_params
        params.require(:blocked_slot).permit(
          :branch_id, :court_id, :date,
          :start_time, :end_time, :reason
        )
      end
    end
  end
end
