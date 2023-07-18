import {Chapter, Game, Player, Turn} from './Model';

export interface TurnResponse extends Turn {
    game: Game
}

export default class GameApi {
    readonly apiBaseUrl: string = window.location.href.substr(0, window.location.href.lastIndexOf(':')) + ':6969';

    savePlayer(playerName: string): Promise<Player> {
        return fetch(this.apiBaseUrl + '/api/v1/player', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: playerName})
        }).then(response => response.json());
    }

    joinGame(playerId: string, gameId: string, storyTitle: string): Promise<Game> {
        return fetch(this.apiBaseUrl + '/api/v1/game/' + gameId + "/join", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                player: {id: playerId},
                storyTitle: storyTitle
            })
        }).then(response => response.json());
    }

    saveGame(gameName: string): Promise<Game> {
        return fetch(this.apiBaseUrl + '/api/v1/game', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: gameName})
        }).then(response => response.json())
    }

    getGames(): Promise<Game[]>  {
        return fetch(this.apiBaseUrl + '/api/v1/game')
            .then(response => response.json())
    }

    getGame(gameId: string): Promise<Game>  {
        return fetch(this.apiBaseUrl + '/api/v1/game/' + gameId)
            .then(response => response.json())
    }

    getTurn(gameId: string, playerId: string): Promise<TurnResponse> {
        return fetch(this.apiBaseUrl + '/api/v1/game/' + gameId + '/turn/' + playerId)
            .then(response => response.json());
    }

    saveTurn(gameId: string, chapter: Chapter): Promise<any> {
        return fetch(this.apiBaseUrl + '/api/v1/game/' + gameId + '/turn', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(chapter)
        });
    }
}