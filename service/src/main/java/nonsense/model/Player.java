package nonsense.model;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

@DatabaseTable(tableName = "players")
public class Player extends IdentifiableEntity {

	public static Player create(String name) {
		return (Player) new Player()
				.setName(name)
				.postConstruct();
	}

	@DatabaseField(unique = true)
	private String name;

	public String getName() {
		return name;
	}

	public Player setName(String name) {
		this.name = name;
		return this;
	}

	@Override
	public String toString() {
		return "Player{" +
				"name='" + name + '\'' +
				"} " + super.toString();
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;

		Player player = (Player) o;

		return name != null ? name.equals(player.name) : player.name == null;
	}

	@Override
	public int hashCode() {
		return name != null ? name.hashCode() : 0;
	}
}
