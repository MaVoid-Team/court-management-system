module Api
  module Admin
    class SettingsController < BaseController
      def show
        setting = Setting.find_by!(branch_id: resolve_branch_id)
        authorize setting
        render json: SettingSerializer.new(setting).serializable_hash, status: :ok
      end

      def create
        setting = Setting.new(setting_params)
        authorize setting
        setting.save!
        render json: SettingSerializer.new(setting).serializable_hash, status: :created
      end

      def update
        setting = Setting.find_by!(branch_id: resolve_branch_id)
        authorize setting
        setting.update!(setting_params)
        render json: SettingSerializer.new(setting).serializable_hash, status: :ok
      end

      private

      def resolve_branch_id
        if current_admin.super_admin? && params[:branch_id].present?
          params[:branch_id]
        else
          current_admin.branch_id
        end
      end

      def setting_params
        params.require(:setting).permit(
          :branch_id, :whatsapp_number,
          :contact_email, :contact_phone,
          :opening_hour, :closing_hour
        )
      end
    end
  end
end
