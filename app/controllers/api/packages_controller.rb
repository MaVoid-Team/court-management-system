module Api
  class PackagesController < BaseController
    def index
      packages = if params[:branch_id].present?
        Package.for_branch(params[:branch_id])
      else
        Package.where(branch_id: nil)
      end

      render json: PackageSerializer.new(paginate(packages)).serializable_hash, status: :ok
    end
  end
end
