module Api
  class CourtsController < BaseController
    def index
      courts = Court.includes(:perks).active
      
      # Filter by branch if specified
      if params[:branch_id].present?
        courts = courts.where(branch_id: params[:branch_id])
      end
      
      render json: CourtSerializer.new(courts).serializable_hash, status: :ok
    end
    
    def show
      court = Court.includes(:perks).active.find(params[:id])
      render json: CourtSerializer.new(court).serializable_hash, status: :ok
    end
  end
end
