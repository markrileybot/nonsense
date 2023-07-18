import * as React from 'react';
import {Game, Player} from './Model';
import {StoryView} from './WriterScreen';

interface Props {
    player: Player,
    game: Game,
}

class ReaderScreen extends React.Component<Props, {}> {
    render() {
        const game = this.props.game;
        const player = this.props.player;
        return (<div className="container">{
            game.stories.map((story) => (<StoryView key={story.id} player={player} story={story} viewAll={true}/>))
        }</div>);
    }
}

export default ReaderScreen;