module Api
  module Admin
    class HourlyRatesController < BaseController
      before_action :set_court
      before_action :set_hourly_rate, only: [ :update, :destroy ]

      def index
        rates = @court.hourly_rates.ordered
        render json: CourtHourlyRateSerializer.new(rates).serializable_hash, status: :ok
      end

      def create
        rate = @court.hourly_rates.new(hourly_rate_params)
        rate.save!
        render json: CourtHourlyRateSerializer.new(rate).serializable_hash, status: :created
      end

      def update
        @hourly_rate.update!(hourly_rate_params)
        render json: CourtHourlyRateSerializer.new(@hourly_rate).serializable_hash, status: :ok
      end

      def destroy
        @hourly_rate.destroy!
        head :no_content
      end

      private

      def set_court
        @court = Court.find(params[:court_id])
        authorize @court
      end

      def set_hourly_rate
        @hourly_rate = @court.hourly_rates.find(params[:id])
      end

      def hourly_rate_params
        params.require(:hourly_rate).permit(:start_hour, :end_hour, :price_per_hour, :active)
      end
    end
  end
end
