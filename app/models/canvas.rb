class Canvas < ApplicationRecord
  before_create :generate_code

  private

  def generate_code
    self.code = loop do
      hex = SecureRandom.hex(2)
      break hex unless Canvas.exists?(code: hex)
    end
  end
end
