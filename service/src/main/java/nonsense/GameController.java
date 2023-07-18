package nonsense;

import com.j256.ormlite.dao.Dao;
import nonsense.db.Db;
import nonsense.event.Event;
import nonsense.event.EventBus;
import nonsense.event.EventType;
import nonsense.model.Chapter;
import nonsense.model.Game;
import nonsense.model.GamePlayer;
import nonsense.model.Player;
import nonsense.model.Story;
import nonsense.model.Turn;

import java.sql.SQLException;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class GameController {

	private final Game game;
	private final EventBus eventBus;
	private final Dao<Player, UUID> playerDao;
	private final Dao<Game, UUID> gameDao;
	private final Dao<Story, UUID> storyDao;
	private final Dao<Chapter, UUID> chapterDao;
	private final Dao<GamePlayer, ?> gamePlayerDao;

	public GameController(Game game,
	                      EventBus eventBus,
	                      Db db
	) {
		this.game = game;
		this.eventBus = eventBus;

		this.playerDao = db.getDao(Player.class);
		this.gameDao = db.getDao(Game.class);
		this.storyDao = db.getDao(Story.class);
		this.chapterDao = db.getDao(Chapter.class);
		this.gamePlayerDao = db.getDao(GamePlayer.class);
	}

	public void startGame() {
		try {
			synchronized (this) {
				if (game.getId() != null && gameDao.idExists(game.getId())) {
					reloadGame();
				} else {
					game.postConstruct();
					gameDao.createOrUpdate(game);
				}
				game.updateState();
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		eventBus.send(new Event()
				.setGameId(game.getId())
				.setData(game)
				.setType(EventType.GAME_STARTED));
	}

	public void reloadGame() {
		synchronized (this) {
			try {
				game.getPlayers().clear();
				game.getStories().clear();

				for (GamePlayer player : gamePlayerDao.queryForEq("game_id", game.getId())) {
					game.getPlayers().add(player
							.setPlayer(playerDao.queryForId(player.getPlayer().getId()))
							.setGame(game));
				}
				for (Story story : storyDao.queryForEq("game_id", game.getId())) {
					story.getChapters().clear();
					game.getStories().add(story.setGame(game));
					for (Chapter chapter : chapterDao.queryForEq("story_id", story.getId())) {
						GamePlayer gamePlayer = game.getPlayer(chapter.getCreator().getId());
						if (gamePlayer == null || gamePlayer.getPlayer() == null) {
							// this shouldn't happen
							throw new RuntimeException("Failed to find " + chapter.getCreator());
						}
						story.getChapters().add(chapter
								.setCreator(gamePlayer.getPlayer())
								.setStory(story));
					}
				}
				System.out.println("Loaded " + game);
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		}
	}

	public Game getGame() {
		return game;
	}

	public Turn getTurn(Player player) {
		Story story = null;
		Chapter lastChapter = null;
		Chapter nextChapter = null;

		synchronized (this) {
			if (!game.isEnded()) {
				GamePlayer gamePlayer = game.getPlayer(player.getId());
				if (gamePlayer == null) {
					throw new IllegalArgumentException("Player is not already in the game!");
				}
				player = gamePlayer.getPlayer();

				Collection<Story> stories = game.getStories();

				// First, does this guy have any incomplete chapters?
				// we want to reload that one if so
				for (Story s : stories) {
					story = s;
					Collection<Chapter> chapters = story.getChapters();

					for (Chapter chapter : chapters) {
						if (!chapter.isCompleted() && chapter.getCreator().getId().equals(player.getId())) {
							nextChapter = chapter;
							break;
						}
						lastChapter = chapter;
					}

					if (nextChapter != null) {
						break;
					}
				}

				// if there are no incomplete chapters, do we need to add a new one?
				if (nextChapter == null) {
					int numPlayers = game.getPlayers().size();
					for (Story s : stories) {
						story = s;
						List<Chapter> chapters = story.getChapters();
						lastChapter = chapters.get(chapters.size() - 1);
						if (lastChapter != null && lastChapter.isCompleted()) {
							int currentPlayer = game.indexOfPlayer(lastChapter.getCreator());
							if ((currentPlayer + 1) % numPlayers == gamePlayer.getIndex()) {
								nextChapter = story.addChapter(player);
								try {
									chapterDao.create(nextChapter);
								} catch (SQLException e) {
									throw new RuntimeException(e);
								}
								break;
							}
						}
					}
				}
			}
			game.updateState();
		}

		if (nextChapter == null) {
			lastChapter = null;
		}

		eventBus.send(new Event()
				.setGameId(game.getId())
				.setType(EventType.TURN_STARTED));

		return new Turn()
				.setGame(game)
				.setStoryId(story == null ? null : story.getId())
				.setLastChapterId(lastChapter == null ? null : lastChapter.getId())
				.setNextChapterId(nextChapter == null ? null : nextChapter.getId());
	}

	public void finishTurn(Chapter chapter) {
		synchronized (this) {
			Collection<Story> stories = game.getStories();
			Story story = null;
			for (Story s : stories) {
				Chapter actualChapter = s.getChapter(chapter.getId());
				if (actualChapter != null) {
					story = s;
					actualChapter.setVisibleOffset(chapter.getVisibleOffset());
					actualChapter.setVisibleLength(chapter.getVisibleLength());
					actualChapter.setText(chapter.getText());

					try {
						chapterDao.createOrUpdate(actualChapter);
					} catch (SQLException e) {
						throw new RuntimeException("Failed to save player", e);
					}

					break;
				}
			}

			if (story == null) {
				throw new IllegalArgumentException("No story for chapter!");
			}
			game.updateState();
		}

		eventBus.send(new Event()
				.setGameId(game.getId())
				.setType(EventType.TURN_ENDED));
	}

	public Chapter addPlayer(Player player, String storyTitle) {
		Chapter chapter = null;
		synchronized (this) {
			if (game.hasPlayer(player)) {
				throw new IllegalArgumentException("Player is already in the game!");
			}

			try {
				player = playerDao.queryForId(player.getId());
				if (player == null) {
					throw new IllegalArgumentException("Player does not exist!");
				}
				gamePlayerDao.create(game.addPlayer(player));
			} catch (SQLException e) {
				throw new RuntimeException(e);
			}

			Story story = game.addStory(storyTitle);
			try {
				storyDao.create(story);
			} catch (SQLException e) {
				throw new RuntimeException(e);
			}

			chapter = story.addChapter(player);

			try {
				chapterDao.create(chapter);
			} catch (SQLException e) {
				throw new RuntimeException("Failed to save game", e);
			}

			game.updateState();
		}

		eventBus.send(new Event()
				.setGameId(game.getId())
				.setType(EventType.PLAYER_ADDED)
				.setData(player));

		return chapter;
	}
}
