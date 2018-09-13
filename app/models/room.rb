class Room < ApplicationRecord
  before_create :generate_code

  def path
    "/c/#{self.code}"
  end

  def self.path(code)
    "/c/#{code}"
  end
  
  private


  def generate_code
    self.code = loop do
      hex = SecureRandom.hex(2)
      break hex unless Room.exists?(code: hex)
    end
  end
end
