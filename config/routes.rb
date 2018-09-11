Rails.application.routes.draw do
  root "canvases#create"

  get "/c/:code", to: "canvases#show", as: "canvas"
  get "/find", to: "canvases#find"
  post "/search", to: "canvases#search"
end
