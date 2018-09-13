Rails.application.routes.draw do
  root "rooms#create"

  get "/c/:code", to: "rooms#show", as: "room"
  post "/search", to: "rooms#search"

  mount ActionCable.server, at: '/cable'
end
