module Api
  module Admin
    class PackagesController < BaseController
      def index
        packages = policy_scope(Package)
        packages = packages.where(branch_id: params[:branch_id]) if params[:branch_id].present?
        render json: PackageSerializer.new(paginate(packages)).serializable_hash, status: :ok
      end

      def show
        package = Package.find(params[:id])
        authorize package
        render json: PackageSerializer.new(package).serializable_hash, status: :ok
      end

      def create
        package = Package.new(package_params)
        authorize package
        package.save!
        render json: PackageSerializer.new(package).serializable_hash, status: :created
      end

      def update
        package = Package.find(params[:id])
        authorize package
        package.update!(package_params)
        render json: PackageSerializer.new(package).serializable_hash, status: :ok
      end

      def destroy
        package = Package.find(params[:id])
        authorize package
        package.destroy!
        head :no_content
      end

      private

      def package_params
        params.require(:package).permit(:branch_id, :title, :description, :price)
      end
    end
  end
end
