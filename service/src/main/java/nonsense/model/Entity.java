package nonsense.model;

import com.j256.ormlite.field.DatabaseField;

public class Entity {

	@DatabaseField
	private long createDate;

	@DatabaseField
	private long updateDate;

	public long getCreateDate() {
		return createDate;
	}

	public Entity setCreateDate(long createDate) {
		this.createDate = createDate;
		return this;
	}

	public long getUpdateDate() {
		return updateDate;
	}

	public Entity setUpdateDate(long updateDate) {
		this.updateDate = updateDate;
		return this;
	}

	protected Entity postConstruct() {
		setCreateDate(System.currentTimeMillis());
		setUpdateDate(System.currentTimeMillis());
		return this;
	}

	@Override
	public String toString() {
		return "Entity{" +
				"createDate=" + createDate +
				", updateDate=" + updateDate +
				'}';
	}
}
