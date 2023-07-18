import * as React from 'react';
import {ChangeEvent} from 'react';
import {Player} from './Model';

interface Props {
    player: Player,
    onNext: (storyTitle: string) => void
}

interface State {
    storyTitle: string,
}

class StoryScreen extends React.Component<Props, State> {
    state: State = {
        storyTitle: '',
    }

    handleStoryTitleChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({storyTitle: event.target.value})
    }

    handleSave() {
        if (!this.state.storyTitle) {
            alert("Name your story!");
        } else {
            this.props.onNext(this.state.storyTitle);
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="container">
                <h1>What's your story's title?</h1>
                <br/>
                <input type="text" className="form-control TextInputLarge"
                           placeholder="The magical world of boogers"
                           onChange={this.handleStoryTitleChange.bind(this)}/>
                <h3>By {this.props.player.name}</h3>
                <br/>
                <button type="button" className="btn btn-primary btn-lg" onClick={this.handleSave.bind(this)}>LARGE BUTTON</button>
            </div>
        );
    }
}

export default StoryScreen;