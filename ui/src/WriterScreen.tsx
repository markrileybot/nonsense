import * as React from 'react';
import {Chapter, Game, Player, Story, Turn} from './Model';
import {Editor, EditorState} from 'draft-js';
import StoryList from './StoryList';

const randomText: string[][] = ((src: string) => {
    const words = src.split(/[\s]+/);
    const wordMap: string[][] = [];

    let currentIndex = words.length;
    let temporaryValue: string;
    let randomIndex: number;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = words[currentIndex];
        words[currentIndex] = words[randomIndex];
        words[randomIndex] = temporaryValue;
    }
    words.forEach(word => {
        if (!wordMap[word.length]) {
            wordMap[word.length] = [];
        }
        wordMap[word.length].push(word);
    });
    return wordMap;
})(`
Far out in the uncharted backwaters of the unfashionable end of
the western spiral arm of the Galaxy lies a small unregarded
yellow sun.

    Orbiting this at a distance of roughly ninety-two million miles is
an utterly insignificant little blue green planet whose ape
descended life forms are so amazingly primitive that they still
think digital watches are a pretty neat idea.

    This planet has - or rather had - a problem, which was this: most
of the people on it were unhappy for pretty much of the time.
    Many solutions were suggested for this problem, but most of
these were largely concerned with the movements of small green
pieces of paper, which is odd because on the whole it wasn't the
small green pieces of paper that were unhappy.

    And so the problem remained; lots of the people were mean, and
most of them were miserable, even the ones with digital watches.
    Many were increasingly of the opinion that they'd all made a big
mistake in coming down from the trees in the first place. And
some said that even the trees had been a bad move, and that no
one should ever have left the oceans.

    And then, one Thursday, nearly two thousand years after one
man had been nailed to a tree for saying how great it would be to
be nice to people for a change, one girl sitting on her own in a
small cafe in Rickmansworth suddenly realized what it was that
had been going wrong all this time, and she finally knew how the
world could be made a good and happy place. This time it was
right, it would work, and no one would have to get nailed to
anything.

    Sadly, however, before she could get to a phone to tell anyone
about it, a terribly stupid catastrophe occurred, and the idea was
lost forever.

    This is not her story.

    But it is the story of that terrible stupid catastrophe and some of
its consequences.

    It is also the story of a book, a book called The Hitch Hiker's
Guide to the Galaxy - not an Earth book, never published on
Earth, and until the terrible catastrophe occurred, never seen or
heard of by any Earthman.

    Nevertheless, a wholly remarkable book.

    In fact it was probably the most remarkable book ever to come
out of the great publishing houses of Ursa Minor - of which no
Earthman had ever heard either.

    Not only is it a wholly remarkable book, it is also a highly
successful one - more popular than the Celestial Home Care
Omnibus, better selling than Fifty More Things to do in Zero
Gravity, and more controversial than Oolon Colluphid's trilogy of
philosophical blockbusters Where God Went Wrong, Some More
of God's Greatest Mistakes and Who is this God Person Anyway?

In many of the more relaxed civilizations on the Outer Eastern
Rim of the Galaxy, the Hitch Hiker's Guide has already
supplanted the great Encyclopedia Galactica as the standard
repository of all knowledge and wisdom, for though it has many
omissions and contains much that is apocryphal, or at least wildly
inaccurate, it scores over the older, more pedestrian work in two
important respects.

    THE HITCHHIKER'S GUIDE TO THE GALAXY
`)
const randomTextLength = randomText.length;


export enum BlurType {
    NONE,
    FULL,
    PARTIAL
}

interface WriterScreenProps {
    player: Player,
    game: Game,
    turn: Turn | null,
    onNext: (chapter: Chapter) => void;
}

interface ChapterViewProps {
    chapter: Chapter,
    index: number,
    blur: BlurType,
    editable?: boolean,
    onNext?: (chapter: Chapter) => void
}

interface ChapterViewState {
    editorState: EditorState,
}

interface OffsetSelection {
    offset: number,
    start: number,
    end: number
}

export class ChapterView extends React.Component<ChapterViewProps, ChapterViewState> {

    static getRandomText(replace: string): string {
        return replace.split('\n').map(line => {
            return line.split(' ').map((word, idx) => {
                const wl = word.length;
                if (wl === 0) {
                    return '';
                }
                const arr = wl >= randomTextLength ? randomText[randomTextLength-1] : randomText[wl];
                return arr[idx % arr.length];
            }).join(' ')
        }).join('\n');
    }

    constructor(props: ChapterViewProps) {
        super(props);
        if (props.editable) {
            this.state = {editorState: EditorState.moveFocusToEnd(EditorState.createEmpty())};
        }
    }

    handleTextChange(editor: EditorState) {
        const chapter = this.props.chapter;

        const selection = editor.getSelection();
        const startKey = selection.getStartKey();
        const selectStart = selection.getStartOffset();
        const endKey = selection.getEndKey();
        const selectEnd = selection.getEndOffset();
        const currentContent = editor.getCurrentContent();

        if (selectEnd !== selectStart || startKey !== endKey) {
            const offsetSelection: OffsetSelection = {
                offset: 0,
                start:  selectStart,
                end: selectEnd
            }
            currentContent.getBlockMap().forEach((block) => {
                if (block?.getKey() === startKey) {
                    offsetSelection.start += offsetSelection.offset;
                }
                if (block?.getKey() === endKey) {
                    offsetSelection.end += offsetSelection.offset;
                }
                offsetSelection.offset += 1 + (block?.getLength() || 0);
                return true;
            });
            chapter.visibleOffset = offsetSelection.start;
            chapter.visibleLength = offsetSelection.end - offsetSelection.start;

        } else {
            chapter.visibleOffset = 0;
            chapter.visibleLength = 0;
        }

        chapter.text = editor.getCurrentContent().getPlainText();
        this.setState({editorState: editor});
    }

    handleSave() {
        if (this.props.onNext) {
            if (!this.props.chapter.text) {
                alert('Write some words!');
            } else if (this.props.chapter.visibleLength <= 0) {
                alert('Select some words to show the next player!');
            } else {
                this.props.onNext(this.props.chapter);
            }
        }
    }

    render() {
        const visibleOffset = this.props.chapter.visibleOffset;
        const visibleLength = this.props.chapter.visibleLength;
        const text = this.props.chapter.text;
        const title = 'Chapter ' + (this.props.index + 1) + ' by ' + (this.props.chapter.creator.name);
        const editable = this.props.editable;
        const blur = this.props.blur;

        let blurryText0 = '';
        let blurryText1 = '';
        let visibleText = '';

        if (text) {
            if (blur === BlurType.NONE || editable) {
                visibleText = text;
            } else if (blur === BlurType.FULL) {
                blurryText0 = ChapterView.getRandomText(text);
            } else {
                blurryText0 = ChapterView.getRandomText(text.substr(0, visibleOffset));
                visibleText = text.substr(visibleOffset, visibleLength);

                const textLen = text.length;
                const blurryTextOffset = visibleOffset + visibleLength;
                if (blurryTextOffset < textLen) {
                    blurryText1 = ChapterView.getRandomText(text.substr(blurryTextOffset, textLen - blurryTextOffset));
                }
            }
        }

        if (editable) {
            return (
                <div className="border-info">
                    <br/>
                    <Editor editorState={this.state.editorState} onChange={this.handleTextChange.bind(this)}/>
                    <p className="card-text float-right"><small className="text-muted">{title}</small></p>
                    <br/>
                    <button type="button" className="btn btn-primary btn-lg" onClick={this.handleSave.bind(this)}>LARGE BUTTON</button>
                </div>
            );
        } else {
            return (
                <div>
                    <p className="card-text pre-formatted">
                        <span className="blurry-text">{blurryText0}</span>
                        <span>{visibleText}</span>
                        <span className="blurry-text">{blurryText1}</span>
                    </p>
                    <p className="card-text float-right"><small className="text-muted">{title}</small></p>
                </div>
            );
        }
    }
}

interface StoryViewProps {
    player: Player,
    lastChapterId?: string,
    nextChapterId?: string,
    viewAll?: boolean,
    story?: Story
    onNext?: (chapter: Chapter) => void;
}

export class StoryView extends React.Component<StoryViewProps, {}> {
    render(): React.ReactNode {
        const player = this.props.player;
        const story = this.props.story;
        const lastChapterId = this.props.lastChapterId;
        const nextChapterId = this.props.nextChapterId;
        const onNext = this.props.onNext;
        const viewAll = this.props.viewAll;

        return (
            <div>
                <div className="card">
                    <div className="card-body">
                        <div className="card-title"><h1>{story?.title}</h1></div>
                        {story?.chapters.map((chapter, index) => {
                            if (viewAll) {
                                return (<ChapterView chapter={chapter} index={index} key={chapter.id} blur={BlurType.NONE} onNext={onNext}/>);
                            } else if (chapter.id === lastChapterId) {
                                return (<ChapterView chapter={chapter} index={index} key={chapter.id} blur={BlurType.PARTIAL} onNext={onNext}/>);
                            } else if (chapter.id === nextChapterId) {
                                return (<ChapterView chapter={chapter} index={index} key={chapter.id} blur={BlurType.NONE} onNext={onNext} editable={true}/>);
                            } else if (chapter.creator.id === player.id) {
                                return (<ChapterView chapter={chapter} index={index} key={chapter.id} blur={BlurType.NONE} onNext={onNext}/>);
                            } else {
                                return (<ChapterView chapter={chapter} index={index} key={chapter.id} blur={BlurType.FULL} onNext={onNext}/>);
                            }
                        })}
                        {!nextChapterId && !viewAll && (<div className="alert alert-primary" role="alert">Waiting for other players...</div>)}
                    </div>
                </div>
            </div>
        );
    }
}

class WriterScreen extends React.Component<WriterScreenProps, {}> {
    render() {
        const player = this.props.player;
        const game = this.props.game;
        const storyId = this.props.turn?.storyId;
        const lastChapterId = this.props.turn?.lastChapterId;
        const nextChapterId = this.props.turn?.nextChapterId;
        const story = game.stories.find((s) => s.id === storyId);

        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <StoryView player={player}
                                   story={story}
                                   lastChapterId={lastChapterId}
                                   nextChapterId={nextChapterId}
                                   onNext={this.props.onNext} />
                    </div>
                    <div className="col col-sm-3">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="card-title">Stories</h3>
                                <div className="card-text">
                                    <StoryList stories={game.stories} selected={storyId} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default WriterScreen;