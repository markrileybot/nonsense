package nonsense;

import io.vertx.core.Handler;
import nonsense.event.EventBus;
import nonsense.model.Chapter;
import nonsense.model.Game;
import nonsense.model.Join;
import nonsense.model.Player;
import nonsense.model.Turn;
import sigma.vertx.deploy.WebSocketRouter;
import sigma.vertx.deploy.WebSocketRoutingContext;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

@Path("/api/v1")
@Produces("application/json")
public class GameApi {

	private final GameManager gameManager;
	private final PlayerManager playerManager;
	private final WebSocketRouter webSocketRouter;

	@Inject
	public GameApi(GameManager gameManager,
	               PlayerManager playerManager,
	               WebSocketRouter webSocketRouter,
	               EventBus eventBus) {
		this.gameManager = gameManager;
		this.webSocketRouter = webSocketRouter;
		this.playerManager = playerManager;

		webSocketRouter.route("/nonsense/v1/game/event", new Handler<WebSocketRoutingContext>() {
			@Override
			public void handle(WebSocketRoutingContext event) {
				event.webSocket().textMessageHandler(new Handler<String>() {
					@Override
					public void handle(String event) {

					}
				});
			}
		});
	}

	@GET
	@Path("/game")
	public Collection<Game> getGames() {
		return gameManager.getActiveGames().values()
				.stream().map(GameController::getGame)
				.collect(Collectors.toList());
	}

	@POST
	@Path("/game")
	public Game createGame(Game game) {
		return gameManager.startGame(game).getGame();
	}

	@GET
	@Path("/game/{id}")
	public Game getGame(@PathParam("id") UUID id) {
		return getController(id).getGame();
	}

	@POST
	@Path("/game/{id}/join")
	public Game joinGame(@PathParam("id") UUID id, Join join) {
		GameController game = getController(id);
		game.addPlayer(join.getPlayer(), join.getStoryTitle());
		return game.getGame();
	}

	@GET
	@Path("/game/{id}/turn/{player}")
	public Turn getNextTurn(@PathParam("id") UUID id, @PathParam("player") UUID playerId) {
		return getController(id).getTurn((Player) new Player().setId(playerId));
	}

	@POST
	@Path("/game/{id}/turn")
	public Game finishTurn(@PathParam("id") UUID id, Chapter chapter) {
		GameController controller = getController(id);
		controller.finishTurn(chapter);
		return controller.getGame();
	}

	private GameController getController(UUID id) {
		GameController game = gameManager.getGame(id);
		if (game != null) {
			return game;
		} else {
			throw new NotFoundException();
		}
	}

	@GET
	@Path("/player/{name}")
	public Player getPlayer(@PathParam("name") String name) {
		return playerManager.getByName(name);
	}

	@POST
	@Path("/player")
	public Player savePlayer(Player player) {
		return playerManager.save(player);
	}
}

