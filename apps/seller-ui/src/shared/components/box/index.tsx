interface BoxProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Box = ({ children, className = '', style }: BoxProps) => {
  return (
    <div className={`box-border ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Box;