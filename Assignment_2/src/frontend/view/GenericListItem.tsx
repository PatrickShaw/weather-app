import './GenericListItem.css';

import * as React from 'react';
import { observer } from 'mobx-react';
interface GenericListItemProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children?: React.ReactNode
}

/**
 * A list item that can be used in a generic sense. Use this as a list and you'll get certain 
 * material ui design aspects for free.
 */
const GenericListItem: React.ClassicComponentClass<GenericListItemProps> = observer(
  ({title, subtitle, children}: GenericListItemProps) => {
    const noSubtitle: boolean = subtitle == null;
    const titleStyle = noSubtitle ? 'txt-body-1' : 'txt-body-2';
    return (
      <section className='list-item-container pad-item-list'>
        <div className='titles'>
          <h1 className={titleStyle}>{title}</h1>
          {noSubtitle ? null : <h2 className='txt-body-1'>{subtitle}</h2>}
        </div>
        <div className='remaining-items'>
          {children}
        </div>
      </section>
    );
  }
);
export {GenericListItem};
export default GenericListItem;
