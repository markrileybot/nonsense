package nonsense.db;

import com.j256.ormlite.dao.Dao;

public interface Db {

	<EntityType, KeyType> Dao<EntityType, KeyType> getDao(Class<EntityType> clazz);
}
