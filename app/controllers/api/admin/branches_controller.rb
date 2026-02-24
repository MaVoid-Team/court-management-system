module Api
  module Admin
    class BranchesController < BaseController
      def index
        branches = policy_scope(Branch)
        render json: BranchSerializer.new(paginate(branches)).serializable_hash, status: :ok
      end

      def show
        branch = Branch.find(params[:id])
        authorize branch
        render json: BranchSerializer.new(branch).serializable_hash, status: :ok
      end

      def create
        branch = Branch.new(branch_params)
        authorize branch
        branch.save!
        render json: BranchSerializer.new(branch).serializable_hash, status: :created
      end

      def update
        branch = Branch.find(params[:id])
        authorize branch
        branch.update!(branch_params)
        render json: BranchSerializer.new(branch).serializable_hash, status: :ok
      end

      def destroy
        branch = Branch.find(params[:id])
        authorize branch
        branch.destroy!
        head :no_content
      end

      private

      def branch_params
        params.require(:branch).permit(:name, :address, :timezone, :active)
      end
    end
  end
end
