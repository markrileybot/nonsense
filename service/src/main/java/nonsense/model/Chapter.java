package nonsense.model;

import com.j256.ormlite.field.DataType;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

@DatabaseTable(tableName = "chapters")
public class Chapter extends IdentifiableEntity {

	public static Chapter create(Player creator, Story story, int index) {
		return (Chapter) new Chapter()
				.setCreator(creator)
				.setStory(story)
				.setIndex(index)
				.postConstruct();
	}

	@DatabaseField(foreign = true)
	private Player creator;

	@DatabaseField(foreign = true)
	private transient Story story;

	@DatabaseField
	private transient int index;

	@DatabaseField
	private long visibleOffset = -1;

	@DatabaseField
	private long visibleLength;

	@DatabaseField(dataType = DataType.LONG_STRING)
	private String text;

	public Player getCreator() {
		return creator;
	}

	public Chapter setCreator(Player creator) {
		this.creator = creator;
		return this;
	}

	public long getVisibleOffset() {
		return visibleOffset;
	}

	public Chapter setVisibleOffset(long visibleOffset) {
		this.visibleOffset = visibleOffset;
		return this;
	}

	public long getVisibleLength() {
		return visibleLength;
	}

	public Chapter setVisibleLength(long visibleLength) {
		this.visibleLength = visibleLength;
		return this;
	}

	public String getText() {
		return text;
	}

	public Chapter setText(String text) {
		this.text = text;
		return this;
	}

	public boolean isCompleted() {
		return text != null && visibleOffset > -1 && visibleLength > 0;
	}

	public Chapter setStory(Story story) {
		this.story = story;
		return this;
	}

	public Story getStory() {
		return story;
	}

	public Chapter setIndex(int index) {
		this.index = index;
		return this;
	}

	public int getIndex() {
		return index;
	}

	@Override
	public String toString() {
		return "Chapter{" +
				"creator=" + creator +
				", index=" + index +
				", visibleOffset=" + visibleOffset +
				", visibleLength=" + visibleLength +
				", text='" + text + '\'' +
				"} " + super.toString();
	}
}
