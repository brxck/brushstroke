Rails.application.routes.draw do
  root "rooms#create"

  get "/c/:code", to: "rooms#show", as: "room"
  get "/c/:code/remote", to: "rooms#remote"
  post "/search", to: "rooms#search"

  mount ActionCable.server, at: '/cable'
end
