import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import './App.css';
import StartScreen from './StartScreen';
import {Chapter, Game, Player, Story, Turn} from './Model';
import StoryScreen from './StoryScreen';
import WriterScreen from './WriterScreen';
import ReaderScreen from './ReaderScreen';
import GameApi, {TurnResponse} from './GameApi';

const gameApi: GameApi = new GameApi();

enum GameState {
    START,
    JOIN,
    WRITE,
    WAIT_FOR_PLAYERS,
    WAIT_FOR_TURN,
    READ
}

interface State {
    player: Player;
    game: Game;
    turn: Turn | null;
}

const defaultState: State = {
    game: new Game(),
    player: new Player(),
    turn: null
}

class Poller<T> {
    call: (() => Promise<T>) | null = null;
    handler: ((t:T) => void) | null = null;
    timeout: number = 1000;
    executing: boolean = false;
    count: number = 0;
    callId: number = 0;

    constructor(call: (() => Promise<T>),
                handler: ((t:T) => void),
                timeout: number = 1000) {
        this.call = call;
        this.timeout = timeout;
        this.handler = handler;
    }

    execute(): void {
        if (this.callId === 0) {
            this.callId = new Date().getTime();
            console.log("Starting new call " + this.callId);
        }
        if (!this.executing) {
            this.executing = true;
            if (this.count === 0) {
                console.log("Making first call " + this.callId);
                this.count++;
                this.poll(this.callId);
            } else {
                console.log("Calling later " + this.callId);
                window.setTimeout(this.poll.bind(this, this.callId), this.timeout);
            }
        } else {
            console.log("Already executing " + this.callId);
        }
    }

    private poll(callId: number): void {
        if (callId === this.callId && this.call) {
            this.call().then((t:T) => {
                console.log("Call complete " + callId);
                this.executing = false;
                if (callId === this.callId && this.handler) {
                    console.log("Call handler " + callId);
                    this.handler(t);
                } else {
                    console.log("Call canceled while calling " + callId + " != " + this.callId);
                }
            });
        } else {
            console.log("Call canceled " + callId);
        }
    }

    cancel(): void {
        this.count = 0;
        this.callId = 0;
        this.executing = false;
    }
}

class App extends React.Component<{}, State> {

    state: State = {...defaultState};
    gamePoller: Poller<Game> = new Poller(this.loadGame.bind(this), this.onGameLoaded.bind(this));
    turnPoller: Poller<TurnResponse> = new Poller(this.loadTurn.bind(this), this.onTurnLoaded.bind(this));

    startGame(playerName: string, gameId?: string, gameName?: string) {
        gameApi.savePlayer(playerName)
            .then(playerResp => {
                if (gameId) {
                    gameApi.getGame(gameId).then(gameResp =>
                        this.setState({player: playerResp, game: gameResp}));
                } else if (gameName) {
                    gameApi.saveGame(gameName).then(gameResp =>
                        this.setState({player: playerResp, game: gameResp}));
                }
            });
    }

    joinGame(storyTitle: string) {
        const gameId = this.state.game.id;
        const playerId = this.state.player.id;
        gameApi.joinGame(playerId, gameId, storyTitle)
            .then(gameResp => this.setState({game: gameResp}));
    }

    loadGame(): Promise<Game> {
        const gameId = this.state.game.id;
        return gameApi.getGame(gameId);
    }

    onGameLoaded(g: Game): void {
        this.setState({game: g});
    }

    loadTurn(): Promise<TurnResponse> {
        const gameId = this.state.game.id;
        const playerId = this.state.player.id;
        return gameApi.getTurn(gameId, playerId);
    }

    onTurnLoaded(t: TurnResponse): void {
        let game: Game = t.game;
        delete t.game;
        this.setState({game: game, turn: t});
    }

    saveTurn(chapter: Chapter) {
        const gameId = this.state.game.id;
        gameApi.saveTurn(gameId, chapter)
            .then(()=> this.setState({turn: null}));
    }

    newGame() {
        let newState = {...defaultState};
        newState.player = this.state.player;
        this.setState(newState);
    }

    newPlayer() {
        this.setState({...defaultState});
    }

    computeState(): GameState {
        const player = this.state.player;
        const game = this.state.game;
        const turn = this.state.turn;

        let state: GameState;
        if (!player.id || !game.id) {
            state = GameState.START;
        } else if (game.turnsRemaining === 0 && game.turns > 0) {
            state = GameState.READ;
        } else {
            state = GameState.JOIN;
            if (game.stories && game.stories.find((s: Story) => {
                return s.chapters.length > 0 && s.chapters[0].creator && s.chapters[0].creator.id === player.id;
            })) {
                if (game.stories.length === 1) {
                    state = GameState.WAIT_FOR_PLAYERS;
                } else if (!turn || !turn.nextChapterId) {
                    state = GameState.WAIT_FOR_TURN;
                } else {
                    state = GameState.WRITE;
                }
            }
        }
        return state;
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<State>, snapshot?: any): void {
        this.ensureStateResolved();
    }

    componentDidMount(): void {
        this.ensureStateResolved();
    }

    ensureStateResolved(): void {
        const state = this.computeState();
        if (state === GameState.WAIT_FOR_TURN) {
            this.turnPoller.execute();
        } else if (state === GameState.WAIT_FOR_PLAYERS) {
            this.gamePoller.execute();
        } else {
            console.log("Cancel calls cause " + state);
            this.turnPoller.cancel();
            this.gamePoller.cancel();
        }
    }

    render() {
        const player = this.state.player;
        const game = this.state.game;
        const turn = this.state.turn;
        const state = this.computeState();

        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a className="navbar-brand" href="#">
                        <img src="/logo.png" width="30" height="30" alt=""/>
                    </a>
                    <span className="navbar-brand">nonsense!</span>
                    <button className="navbar-toggler" type="button" data-toggle="collapse"
                            data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"/>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item">
                                <button className="btn btn-outline-success" type="button" onClick={this.newGame.bind(this)}>switch game</button>&nbsp;
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-outline-success" type="button" onClick={this.newPlayer.bind(this)}>switch player</button>&nbsp;
                            </li>
                        </ul>
                    </div>
                    <div className="my-2 my-lg-0">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item navbar-brand">
                                {player.name} / {game.name}
                            </li>
                        </ul>
                    </div>
                </nav>
                <div className="jumbotron">
                    {state === GameState.START && (<StartScreen player={player} gamesLoader={gameApi.getGames.bind(gameApi)} onNext={this.startGame.bind(this)}/>)}
                    {state === GameState.JOIN  && (<StoryScreen player={player} onNext={this.joinGame.bind(this)}/>)}
                    {state === GameState.WRITE && (<WriterScreen player={player} game={game} turn={turn} onNext={this.saveTurn.bind(this)}/>)}
                    {state === GameState.WAIT_FOR_TURN && (<WriterScreen player={player} game={game} turn={turn} onNext={this.saveTurn.bind(this)}/>)}
                    {state === GameState.WAIT_FOR_PLAYERS && (<div className="container"><h1>Waiting for more players...</h1></div>)}
                    {state === GameState.READ  && (<ReaderScreen player={player} game={game}/>)}
                </div>
            </div>
        );
    }
}

export default App;
