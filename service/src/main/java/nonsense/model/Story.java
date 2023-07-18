package nonsense.model;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@DatabaseTable(tableName = "stories")
public class Story extends IdentifiableEntity {

	public static Story create(Game game, String title, int index) {
		return (Story) new Story()
				.setTitle(title)
				.setIndex(index)
				.setGame(game)
				.postConstruct();
	}

	@DatabaseField
	private String title;

	@DatabaseField(foreign = true)
	private transient Game game;

	@DatabaseField
	private transient int index;

	private List<Chapter> chapters;

	public String getTitle() {
		return title;
	}

	public Story setTitle(String title) {
		this.title = title;
		return this;
	}

	public Story setGame(Game game) {
		this.game = game;
		return this;
	}

	public Game getGame() {
		return game;
	}

	public Story setIndex(int index) {
		this.index = index;
		return this;
	}

	public int getIndex() {
		return index;
	}

	public List<Chapter> getChapters() {
		if (chapters == null) {
			chapters = new ArrayList<>();
		}
		return chapters;
	}

	public Story setChapters(List<Chapter> chapters) {
		this.chapters = chapters;
		return this;
	}

	public Chapter getChapter(UUID chapterId) {
		if (chapterId == null) {
			return null;
		}
		for (Chapter chapter : getChapters()) {
			if (chapter.getId().equals(chapterId)) {
				return chapter;
			}
		}
		return  null;
	}

	public Chapter addChapter(Player player) {
		Chapter chapter = Chapter.create(player, this, getChapters().size());
		getChapters().add(chapter);
		return chapter;
	}

	@Override
	public String toString() {
		return "Story{" +
				"title='" + title + '\'' +
				", index=" + index +
				", chapters=" + chapters +
				"} " + super.toString();
	}
}
