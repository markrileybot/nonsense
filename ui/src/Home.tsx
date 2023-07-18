import React from 'react';

interface Props {

}

export default class Home extends React.Component<Props, any> {
    static defaultProps: Props = {

    }

    render(): React.ReactNode {
        return (<h2>HI</h2>);
    }
}