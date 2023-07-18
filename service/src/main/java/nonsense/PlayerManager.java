package nonsense;

import com.j256.ormlite.dao.Dao;
import nonsense.db.Db;
import nonsense.model.Player;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.sql.SQLException;
import java.util.UUID;

@Singleton
public class PlayerManager {

	private final Dao<Player, UUID> playerDao;

	@Inject
	public PlayerManager(Db db) {
		this.playerDao = db.getDao(Player.class);
	}

	public Player save(Player player) {
		try {
			if (playerDao.idExists(player.getId())) {
				playerDao.update(player);
			} else {
				Player byName = getByName(player.getName());
				if (byName == null) {
					player = Player.create(player.getName());
					playerDao.create(player);
				} else {
					player = byName;
				}
			}
			return player;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public Player getByName(String name) {
		try {
			return playerDao.queryForFirst(playerDao.queryBuilder()
					.where().eq("name", name).prepare());
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
}
