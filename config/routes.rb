require "sidekiq/web"

Rails.application.routes.draw do
  namespace :api do
    get "packages/:id", to: "packages#show"
    get "packages", to: "packages#index"
    get "events", to: "events#index"
    get "events/:id", to: "events#show"
    get "availability", to: "availability#index"
    post "bookings", to: "bookings#create"

    namespace :admin do
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"

      resources :branches
      resources :courts
      resources :packages
      resources :events
      resources :bookings, only: %i[index show update]
      resources :blocked_slots, only: %i[index show create update destroy]
      resource :settings, only: %i[show create update]
      resources :admins, only: %i[index create update destroy]
      get "statistics", to: "statistics#index"
    end
  end

  mount Sidekiq::Web => "/sidekiq" if Rails.env.development?

  get "up" => "rails/health#show", as: :rails_health_check
end
