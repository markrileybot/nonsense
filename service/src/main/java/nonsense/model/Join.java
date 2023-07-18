package nonsense.model;

public class Join {
	private Player player;
	private String storyTitle;

	public Player getPlayer() {
		return player;
	}

	public Join setPlayer(Player player) {
		this.player = player;
		return this;
	}

	public String getStoryTitle() {
		return storyTitle;
	}

	public Join setStoryTitle(String storyTitle) {
		this.storyTitle = storyTitle;
		return this;
	}
}
