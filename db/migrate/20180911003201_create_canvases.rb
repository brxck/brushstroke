class CreateCanvases < ActiveRecord::Migration[5.2]
  def change
    create_table :canvases do |t|
      t.string :code

      t.timestamps
    end
    add_index :canvases, :code, unique: true
  end
end
