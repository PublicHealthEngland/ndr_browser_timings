# frozen_string_literal: true

Rails.application.routes.draw do
  mount NdrBrowserTimings::Engine => '/ndr_browser_timings'
end