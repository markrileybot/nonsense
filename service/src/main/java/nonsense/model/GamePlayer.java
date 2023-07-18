package nonsense.model;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

@DatabaseTable(tableName = "game_players")
public class GamePlayer {

	@DatabaseField(foreign = true)
	private transient Game game;

	@DatabaseField(foreign = true)
	private Player player;

	@DatabaseField
	private transient int index;

	public Game getGame() {
		return game;
	}

	public GamePlayer setGame(Game game) {
		this.game = game;
		return this;
	}

	public Player getPlayer() {
		return player;
	}

	public GamePlayer setPlayer(Player player) {
		this.player = player;
		return this;
	}

	public GamePlayer setIndex(int index) {
		this.index = index;
		return this;
	}

	public int getIndex() {
		return index;
	}

	@Override
	public String toString() {
		return "GamePlayer{" +
				"player=" + player +
				", index=" + index +
				'}';
	}
}
