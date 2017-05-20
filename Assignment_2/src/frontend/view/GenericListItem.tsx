import './GenericListItem.scss';

import * as React from 'react';

interface GenericListItemProps {
  readonly title: string;
  readonly subtitle?: string;
}

/**
 * A list item that can be used in a generic sense. Use this as a list and you'll get certain 
 * material ui design aspects for free.
 */
class GenericListItem extends React.Component<GenericListItemProps, void> {
  constructor(props: GenericListItemProps) {
    super(props);
  }

  public render(): JSX.Element {
    const noSubtitle: boolean = this.props.subtitle == null;
    const titleStyle = noSubtitle ? 'txt-body-1' : 'txt-body-2';
    return (
      <section className='list-item-container'>
        <div className='titles pad-item-list'>
          <h1 className={titleStyle}>{this.props.title}</h1>
          {noSubtitle ? null : <h2 className='txt-body-1'>{this.props.subtitle}</h2>}
        </div>
        <div className='remaining-items'>
          {this.props.children}
        </div>
      </section>
    );
  }
}

export {GenericListItem};
export default GenericListItem;
