import * as React from 'react';
interface ListItemProps {
    title: string;
    subtitle?: string;
}
class GenericListItem extends React.Component<ListItemProps, void> {
    constructor() {
        super();
    }
    render() {
        const noSubtitle: boolean = this.props.subtitle == null;
        const titleStyle = noSubtitle ? 'txt-body-1' : 'txt-body-2';
        return (
            <section className="pad-item-list">
                <h1 className={titleStyle}>{this.props.title}</h1>
                {
                    noSubtitle ? null : <h2 className="txt-body-1">{this.props.subtitle}</h2> 
                }
            </section>
        );
    }
}
export {GenericListItem};
export default GenericListItem;
