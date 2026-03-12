module Api
  class BookingsController < BaseController
    def create
      branch = Branch.find(params[:branch_id])

      result = Bookings::Creator.new(
        params: booking_params,
        branch: branch
      ).call

      if result.success?
        render json: BookingSerializer.new(result.data).serializable_hash, status: :created
      else
        render json: { errors: result.errors }, status: :unprocessable_entity
      end
    end

    private

    def booking_params
      params.require(:booking).permit(
        :court_id, :user_name, :user_phone,
        :date, :start_time, :end_time, :notes, :promo_code,
        booking_slots_attributes: [:start_time, :end_time]
      )
    end
  end
end
