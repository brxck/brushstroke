class Canvas < ApplicationRecord
  before_create :generate_code

  private

  def generate_code
    self.code = SecureRandom.hex(2)
  end
end
