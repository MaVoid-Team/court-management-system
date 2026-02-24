module Api
  module Admin
    class AdminsController < BaseController
      def index
        admins = policy_scope(::Admin)
        render json: AdminSerializer.new(paginate(admins)).serializable_hash, status: :ok
      end

      def create
        admin = ::Admin.new(admin_params)
        authorize admin
        admin.save!
        render json: AdminSerializer.new(admin).serializable_hash, status: :created
      end

      def update
        admin = ::Admin.find(params[:id])
        authorize admin
        admin.update!(admin_params)
        render json: AdminSerializer.new(admin).serializable_hash, status: :ok
      end

      def destroy
        admin = ::Admin.find(params[:id])
        authorize admin
        admin.destroy!
        head :no_content
      end

      private

      def admin_params
        params.require(:admin).permit(:branch_id, :email, :password, :password_confirmation, :role)
      end
    end
  end
end
