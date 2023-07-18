package nonsense.model;


import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@DatabaseTable(tableName = "games")
public class Game extends IdentifiableEntity {

	@DatabaseField
	private String name;

	private List<Story> stories;

	private List<GamePlayer> players;

	@DatabaseField
	private int turnsPerPlayer = 2;

	@DatabaseField
	private boolean showTitles = true;

	private int turnsRemaining;

	private int turns;

	@Override
	public Game postConstruct() {
		super.postConstruct();
		return this;
	}

	public String getName() {
		return name;
	}

	public Game setName(String name) {
		this.name = name;
		return this;
	}

	public Game setTurnsPerPlayer(int turnsPerPlayer) {
		this.turnsPerPlayer = turnsPerPlayer;
		return this;
	}

	public int getTurnsPerPlayer() {
		return turnsPerPlayer;
	}

	public Game setShowTitles(boolean showTitles) {
		this.showTitles = showTitles;
		return this;
	}

	public boolean isShowTitles() {
		return showTitles;
	}

	public List<Story> getStories() {
		if (stories == null) {
			stories = new ArrayList<>();
		}
		return stories;
	}

	public Story getStory(Chapter chapter) {
		for (Story story : getStories()) {
			if (story.getChapter(chapter.getId()) != null) {
				return story;
			}
		}
		return null;
	}

	public Game setStories(List<Story> stories) {
		this.stories = stories;
		return this;
	}

	public List<GamePlayer> getPlayers() {
		if (players == null) {
			players = new ArrayList<>();
		}
		return players;
	}

	public Game setPlayers(List<GamePlayer> players) {
		this.players = players;
		return this;
	}

	public boolean hasPlayer(Player player) {
		return player != null && hasPlayer(player.getId());
	}

	public int indexOfPlayer(Player player) {
		return player == null ? -1 : indexOfPlayer(player.getId());
	}

	public boolean hasPlayer(UUID id) {
		return indexOfPlayer(id) > -1;
	}

	public int indexOfPlayer(UUID id) {
		GamePlayer player = getPlayer(id);
		return player == null ? -1 : player.getIndex();
	}

	public GamePlayer getPlayer(UUID id) {
		for (GamePlayer player : getPlayers()) {
			if (player != null && player.getPlayer().getId().equals(id)) {
				return player;
			}
		}
		return null;
	}

	public GamePlayer addPlayer(Player player) {
		GamePlayer gamePlayer = new GamePlayer()
				.setPlayer(player)
				.setGame(this)
				.setIndex(getPlayers().size());
		getPlayers().add(gamePlayer);
		return gamePlayer;
	}

	public Story addStory(String storyTitle) {
		Story story = Story.create(this, storyTitle, getStories().size());
		getStories().add(story);
		return story;
	}

	public boolean isEnded() {
		return getTurnsRemaining() == 0;
	}

	public int getTurns() {
		int numPlayers = getPlayers().size();
		return numPlayers * numPlayers * turnsPerPlayer;
	}

	public int getTurnsRemaining() {
		int numChaps = 0;
		for (Story story : getStories()) {
			for (Chapter chapter : story.getChapters()) {
				if (chapter.isCompleted()) {
					numChaps++;
				}
			}
		}
		return getTurns() - numChaps;
	}

	public void updateState() {
		turns = getTurns();
		turnsRemaining = getTurnsRemaining();
	}

	@Override
	public String toString() {
		return "Game{" +
				"name='" + name + '\'' +
				", stories=" + stories +
				", players=" + players +
				", turnsPerPlayer=" + turnsPerPlayer +
				", showTitles=" + showTitles +
				", turnsRemaining=" + turnsRemaining +
				", turns=" + turns +
				"} " + super.toString();
	}
}
