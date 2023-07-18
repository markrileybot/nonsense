import * as React from 'react';
import {ListGroup, ListGroupItem} from 'reactstrap';
import {Game} from './Model';
import {LoadableComponent, LoadableProps, LoadableState} from './LoadableComponent';

interface Props extends LoadableProps<Game[]> {
    selected: string,
    onSelect: (id: string) => void
}

export default class GameList extends LoadableComponent<Game[], Props, LoadableState<Game[]>> {

    state: LoadableState<Game[]> = {
        data: [],
        loading: true,
        error: null,
    }

    onClick(id: string): void {
        if (id === "1") {
            alert("It says there isn't any!");
        }
        this.props.onSelect(id);
    }

    componentDidLoad(data: Game[]) {
        data.sort((g0, g1) => {
            return -((g0.createDate || 0) - (g1.createDate || 0));
        });
    }

    renderError() {
        return (<ListGroup className="GameList"><ListGroupItem className="list-group-item-danger">Error: {this.state.error}</ListGroupItem></ListGroup>);
    }

    renderLoaded() {
        if (!this.state.data || this.state.data.length === 0) {
            return (<ListGroup className="GameList disabled"><ListGroupItem className="text-muted">No current games</ListGroupItem></ListGroup>)
        }
        return (<ListGroup className="GameList">{this.state.data?.map(game => (
            <ListGroupItem key={game.id}
                           onClick={this.onClick.bind(this, game.id)}
                           action={true}
                           active={this.props.selected === game.id}>{game.name} <span className="badge badge-success badge-pill float-right">{game.players?.length}</span></ListGroupItem>
        ))}</ListGroup>)
    }

    renderLoading() {
        return (<ListGroup><ListGroupItem className="list-group-item-info">Loading...</ListGroupItem></ListGroup>);
    }
}