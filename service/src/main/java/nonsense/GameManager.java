package nonsense;

import com.j256.ormlite.dao.CloseableIterator;
import com.j256.ormlite.dao.Dao;
import nonsense.db.Db;
import nonsense.event.EventBus;
import nonsense.model.Game;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Singleton
public class GameManager {

	private final Map<UUID, GameController> activeGames = new ConcurrentHashMap<>();
	private final Db db;
	private final EventBus eventBus;

	@Inject
	public GameManager(EventBus eventBus,
	                   Db db
	) {
		this.db = db;
		this.eventBus = eventBus;

		Dao<Game, UUID> dao = db.getDao(Game.class);
		try (CloseableIterator<Game> iterator = dao.iterator()) {
			while (iterator.hasNext()) {
				GameController next = new GameController(iterator.next(), eventBus, db);
				next.startGame();
				if (!next.getGame().isEnded()) {
					activeGames.put(next.getGame().getId(), next);
				}
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	public Map<UUID, GameController> getActiveGames() {
		return activeGames;
	}

	public GameController getGame(UUID id) {
		return activeGames.get(id);
	}

	public GameController startGame(Game game) {
		GameController gameController = new GameController(game, eventBus, db);
		gameController.startGame();

		activeGames.put(game.getId(), gameController);
		return gameController;
	}
}
