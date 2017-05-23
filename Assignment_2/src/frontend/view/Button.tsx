import * as React from 'react';
import './Button.scss';
interface ButtonProps {
  readonly selected?: boolean;
  // TODO: Get rid of this at some point. Don't like the idea of passing in props.
  readonly backgroundColor: string; 
}
class Button extends React.Component<ButtonProps, void> {
  public render(): JSX.Element {
    return (
      <button style={{backgroundColor: this.props.backgroundColor}} className='button-margin'>
        <div className={`button-ripple button-padding `}>
          {this.props.children}
        </div>
      </button>
    );
  }
}
export { Button };
export default Button;
