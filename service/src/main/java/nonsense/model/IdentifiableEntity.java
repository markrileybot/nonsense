package nonsense.model;

import com.j256.ormlite.field.DatabaseField;

import java.util.UUID;

public class IdentifiableEntity extends Entity {

	@DatabaseField(id = true)
	private UUID id;

	public UUID getId() {
		return id;
	}

	public IdentifiableEntity setId(UUID id) {
		this.id = id;
		return this;
	}

	@Override
	protected IdentifiableEntity postConstruct() {
		super.postConstruct();
		setId(UUID.randomUUID());
		return this;
	}

	@Override
	public String toString() {
		return "IdentifiableEntity{" +
				"id=" + id +
				"} " + super.toString();
	}
}
