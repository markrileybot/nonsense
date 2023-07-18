
export class Player {
    id: string = '';
    name: string = '';
}

export interface Chapter {
    id: string,
    creator: Player,
    text: string,
    visibleOffset: number,
    visibleLength: number
}

export interface Story {
    id: string,
    title: string,
    chapters: Chapter[],
}

export class Game {
    id: string = '';
    name: string = '';
    turns: number = 0;
    turnsRemaining: number = 0;
    stories: Story[] = [];
    players: Player[] = [];
    createDate: number = 0;
    updateDate: number = 0;
}

export interface Turn {
    storyId: string,
    lastChapterId?: string,
    nextChapterId?: string
}