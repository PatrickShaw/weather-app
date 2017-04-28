import * as React from 'react';
interface ListItemProps {
    title: string;
    subtitle: string;
}
class ListItem extends React.Component<ListItemProps, void> {
    constructor() {
        super();
    }
    render() {
        return (
            <section>
                <h1>{this.props.title}</h1>
                <h2>{this.props.subtitle}</h2>
            </section>
        );
    }
}
export {ListItem};
export default ListItem;
