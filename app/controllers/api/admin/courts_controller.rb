module Api
  module Admin
    class CourtsController < BaseController
      def index
        courts = policy_scope(Court).includes(:branch)
        courts = courts.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        render json: CourtSerializer.new(paginate(courts)).serializable_hash, status: :ok
      end

      def show
        court = Court.find(params[:id])
        authorize court
        render json: CourtSerializer.new(court).serializable_hash, status: :ok
      end

      def create
        court = Court.new(court_params)
        authorize court
        court.save!
        render json: CourtSerializer.new(court).serializable_hash, status: :created
      end

      def update
        court = Court.find(params[:id])
        authorize court
        court.update!(court_params)
        render json: CourtSerializer.new(court).serializable_hash, status: :ok
      end

      def destroy
        court = Court.find(params[:id])
        authorize court
        court.destroy!
        head :no_content
      end

      private

      def court_params
        params.require(:court).permit(:branch_id, :name, :price_per_hour, :active)
      end
    end
  end
end
