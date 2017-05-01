import * as React from 'react';

import {OnClickObserver} from '../observers/OnClickObserver';

interface GenericListItemProps {
  title: string;
  subtitle?: string;
  onClickObserver?: OnClickObserver;
}

class GenericListItem extends React.Component<GenericListItemProps, void> {
  private onListItemClickedBound: any;
  constructor(props: GenericListItemProps) {
    super(props);
    this.onListItemClickedBound = this.onListItemClicked.bind(this, this.props.onClickObserver);
  }
  public render(): JSX.Element {
    const noSubtitle: boolean = this.props.subtitle == null;
    const titleStyle = noSubtitle ? 'txt-body-1' : 'txt-body-2';
    return (
      <section className="pad-item-list" onClick={this.onListItemClickedBound}>
        <h1 className={titleStyle}>{this.props.title}</h1>
        {noSubtitle ? null : <h2 className="txt-body-1">{this.props.subtitle}</h2>}
      </section>
    );
  }
  private onListItemClicked(onClickObserver: OnClickObserver, event: React.MouseEvent<HTMLElement>): void {
    if (onClickObserver) {
      onClickObserver.onClick();
    }
  }
}
export {GenericListItem};
export default GenericListItem;
