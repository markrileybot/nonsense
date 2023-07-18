import * as React from 'react';
import {ListGroup, ListGroupItem} from 'reactstrap';
import {Story} from './Model';

interface Props {
    selected?: string,
    stories: Story[]
}

export default class StoryList extends React.Component<Props, {}> {
    render() {
        const stories = this.props.stories;
        const selected = this.props.selected;
        return (<ListGroup>{stories?.map(story => (
            <ListGroupItem key={story.id}
                           className={selected === story.id ? "list-group-item-success" : ""}>
                <div>{story.title}</div>
                <small className="text-muted float-right">By {story.chapters?.length > 0 ? story.chapters[0].creator.name : '?'}</small>
            </ListGroupItem>
        ))}</ListGroup>)
    }
}