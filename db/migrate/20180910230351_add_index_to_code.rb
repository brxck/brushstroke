class AddIndexToCode < ActiveRecord::Migration[5.2]
  def change
    add_index :canvases, :code
  end
end
