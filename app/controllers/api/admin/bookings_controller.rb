module Api
  module Admin
    class BookingsController < BaseController
      def index
        bookings = policy_scope(Booking).includes(:court, :branch)
        bookings = bookings.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        bookings = bookings.where(court_id: params[:court_id]) if params[:court_id].present?
        bookings = bookings.where(date: params[:date]) if params[:date].present?
        bookings = bookings.where(status: params[:status]) if params[:status].present?
        render json: BookingSerializer.new(paginate(bookings)).serializable_hash, status: :ok
      end

      def show
        booking = Booking.find(params[:id])
        authorize booking
        render json: BookingSerializer.new(booking).serializable_hash, status: :ok
      end

      def update
        booking = Booking.find(params[:id])
        authorize booking

        if params[:cancel].present?
          result = Bookings::Canceller.new(booking: booking).call
          if result.success?
            render json: BookingSerializer.new(result.data).serializable_hash, status: :ok
          else
            render json: { errors: result.errors }, status: :unprocessable_entity
          end
        else
          booking.update!(booking_update_params)
          render json: BookingSerializer.new(booking).serializable_hash, status: :ok
        end
      end

      private

      def booking_update_params
        params.require(:booking).permit(:payment_status)
      end
    end
  end
end
