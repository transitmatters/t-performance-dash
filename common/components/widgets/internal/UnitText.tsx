import classNames from 'classnames';

interface UnitTextProps {
  text: string;
  isLarge?: boolean;
}

export const UnitText = ({ text, isLarge = false }: UnitTextProps) => {
  return (
    // The unit rides alongside a figure that uses the card foreground, so it takes the muted
    // foreground token rather than a fixed grey that only reads on a light surface.
    <span className={classNames('text-muted-foreground', isLarge ? 'text-md' : 'text-sm')}>
      {text}
    </span>
  );
};
