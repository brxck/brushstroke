Rails.application.routes.draw do
  root "canvases#create"

  get "/c/:code", to: "canvases#show", as: "canvas"
  post "/search", to: "canvases#search"
end
