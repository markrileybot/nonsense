package nonsense.db;

import com.j256.ormlite.dao.Dao;
import com.j256.ormlite.dao.DaoManager;
import com.j256.ormlite.jdbc.DataSourceConnectionSource;
import com.j256.ormlite.table.TableUtils;
import nonsense.model.Chapter;
import nonsense.model.Game;
import nonsense.model.GamePlayer;
import nonsense.model.Player;
import nonsense.model.Story;
import sigma.data.DataStore;
import sigma.data.resource.ResourceManager;
import sigma.inject.Injectable;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Singleton
@Injectable(Db.class)
public class DefaultDb implements Db {

	private final Map<Class<?>, Dao<?, ?>> daos = new ConcurrentHashMap<>();
	private final DataSourceConnectionSource connectionSource;

	@Inject
	public DefaultDb(ResourceManager resourceManager) throws Exception {
		DataSource dataSource = resourceManager.getDataStoreResource(DataStore.ADMIN);
		connectionSource = new DataSourceConnectionSource(dataSource, "jdbc:postgresql://itdoesnotmatter/");
		TableUtils.createTableIfNotExists(connectionSource, Player.class);
		TableUtils.createTableIfNotExists(connectionSource, GamePlayer.class);
		TableUtils.createTableIfNotExists(connectionSource, Chapter.class);
		TableUtils.createTableIfNotExists(connectionSource, Story.class);
		TableUtils.createTableIfNotExists(connectionSource, Game.class);
	}

	@SuppressWarnings("unchecked")
	@Override
	public <EntityType, KeyType> Dao<EntityType, KeyType> getDao(Class<EntityType> clazz) {
		return (Dao<EntityType, KeyType>) daos.computeIfAbsent(clazz, c -> {
			try {
				return DaoManager.createDao(connectionSource, clazz);
			} catch (SQLException e) {
				throw new RuntimeException(e);
			}
		});
	}
}
