module Bookings
  class Creator
    def initialize(params:, branch:)
      @params = params
      @branch = branch
    end

    def call
      return ServiceResult.failure("Branch is not active") unless @branch.active?

      court = Court.find_by(id: @params[:court_id], branch_id: @branch.id)
      return ServiceResult.failure("Court not found or does not belong to this branch") unless court
      return ServiceResult.failure("Court is not active") unless court.active?

      date = parse_date(@params[:date])
      return ServiceResult.failure("Invalid date format") unless date
      return ServiceResult.failure("Cannot book in the past") if date < Date.current

      start_time = parse_time(@params[:start_time])
      end_time = parse_time(@params[:end_time])
      return ServiceResult.failure("Invalid time format") unless start_time && end_time
      return ServiceResult.failure("End time must be after start time") if end_time <= start_time

      hours = ((end_time - start_time) / 1.hour).ceil
      total_price = hours * court.price_per_hour

      booking = nil

      ActiveRecord::Base.transaction do
        Court.lock("FOR UPDATE").find(court.id)

        if Booking.overlapping(court.id, date, start_time, end_time).exists?
          raise ActiveRecord::Rollback, "overlap"
        end

        if BlockedSlot.overlapping(court.id, date, start_time, end_time).exists?
          raise ActiveRecord::Rollback, "blocked"
        end

        booking = Booking.create!(
          branch: @branch,
          court: court,
          user_name: @params[:user_name],
          user_phone: @params[:user_phone],
          date: date,
          start_time: start_time,
          end_time: end_time,
          hours: hours,
          total_price: total_price,
          status: :confirmed,
          payment_status: :pending
        )
      end

      return ServiceResult.failure("Time slot is not available") unless booking

      Availability::CacheInvalidator.new(
        branch_id: @branch.id,
        court_id: court.id,
        date: date
      ).call

      BookingConfirmationJob.perform_later(booking.id)

      ServiceResult.success(booking)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages)
    end

    private

    def parse_date(date_str)
      Date.parse(date_str.to_s)
    rescue ArgumentError, TypeError
      nil
    end

    def parse_time(time_str)
      Time.zone.parse(time_str.to_s)
    rescue ArgumentError, TypeError
      nil
    end
  end
end
