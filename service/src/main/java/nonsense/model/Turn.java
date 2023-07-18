package nonsense.model;

import java.util.UUID;

public class Turn {

	private Game game;
	private UUID storyId;
	private UUID lastChapterId;
	private UUID nextChapterId;

	public Game getGame() {
		return game;
	}

	public Turn setGame(Game game) {
		this.game = game;
		return this;
	}

	public Turn setStoryId(UUID storyId) {
		this.storyId = storyId;
		return this;
	}

	public UUID getStoryId() {
		return storyId;
	}

	public UUID getLastChapterId() {
		return lastChapterId;
	}

	public Turn setLastChapterId(UUID lastChapterId) {
		this.lastChapterId = lastChapterId;
		return this;
	}

	public UUID getNextChapterId() {
		return nextChapterId;
	}

	public Turn setNextChapterId(UUID nextChapterId) {
		this.nextChapterId = nextChapterId;
		return this;
	}
}
