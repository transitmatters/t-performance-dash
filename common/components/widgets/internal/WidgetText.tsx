import classNames from 'classnames';

export interface WidgetTextProps {
  text: string;
  isLarge?: boolean;
}
export const WidgetText = ({ text, isLarge = false }: WidgetTextProps) => {
  return (
    <span className={classNames('text-card-foreground', isLarge ? 'text-2xl' : 'text-sm')}>
      {text}
    </span>
  );
};
