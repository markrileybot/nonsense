package nonsense.event;

import sigma.inject.Injectable;

import javax.inject.Singleton;

@Singleton
@Injectable(EventBus.class)
public class DefaultEventBus implements EventBus {
	@Override
	public void addListener(Event event) {

	}

	@Override
	public void send(Event event) {

	}
}
