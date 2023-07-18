import * as React from 'react';
import {ChangeEvent} from 'react';
import {Game, Player} from './Model';
import GameList from './GameList';

interface Props {
    player: Player,
    gamesLoader: () => Promise<Game[]>,
    onNext: (name: string, gameId?: string, gameName?: string) => void
}

interface State {
    playerName: string,
    gameId: string,
    gameName: string
}

class StartScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            playerName: props.player.name,
            gameId: '',
            gameName: ''
        }
    }

    handlePlayerNameChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({playerName: event.target.value});
    }

    handleGameNameChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({gameName: event.target.value, gameId: ""})
    }

    handleGameSelect(gameId: string) {
        this.setState({gameName: "", gameId: gameId})
    }

    handleSave() {
        if (!this.state.playerName) {
            alert("Gimme your name!");
        } else if (!this.state.gameId && !this.state.gameName) {
            alert("Start a game or pick a game!");
        } else {
            this.props.onNext(this.state.playerName, this.state.gameId, this.state.gameName);
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="container">
                <h1>Hello, <input type="text" className="form-control form-control-inline TextInputLarge" placeholder="HUMON'S NAME"
                                  defaultValue={this.props.player.name}
                                  onChange={this.handlePlayerNameChange.bind(this)}/>, this is nonsense!</h1>
                <br/>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="card-title">Start a game</h3>
                                <div className="card-text">
                                    <input type="text" className="form-control TextInputLarge" placeholder="A NEW GAME NAME"
                                           value={this.state.gameName}
                                           onChange={this.handleGameNameChange.bind(this)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="card-title">Join a game</h3>
                                <div className="card-text">
                                    <GameList loader={this.props.gamesLoader}
                                              onSelect={this.handleGameSelect.bind(this)}
                                              selected={this.state.gameId}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <br/>
                <button type="button" className="btn btn-primary btn-lg" onClick={this.handleSave.bind(this)}>LARGE START BUTTON</button>
            </div>
        );
    }
}

export default StartScreen;