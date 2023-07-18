package nonsense.event;

import java.util.UUID;

public class Event {

	private UUID gameId;

	private EventType type;

	private Object data;

	public UUID getGameId() {
		return gameId;
	}

	public Event setGameId(UUID gameId) {
		this.gameId = gameId;
		return this;
	}

	public EventType getType() {
		return type;
	}

	public Event setType(EventType type) {
		this.type = type;
		return this;
	}

	public Object getData() {
		return data;
	}

	public Event setData(Object data) {
		this.data = data;
		return this;
	}
}
