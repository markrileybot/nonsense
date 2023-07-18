package nonsense.event;

public interface EventBus {

	void addListener(Event event);

	void send(Event event);
}
