import './Toolbar.css';

interface ToolbarProps extends React.PropsWithChildren {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export default function Toolbar({ children, left, right }: ToolbarProps) {
  return (
    <div className="Toolbar">
      {children && <div className="Toolbar-center">{children}</div>}
      {!children && (
        <>
          <div className="Toolbar-left">{left}</div>
          <div className="Toolbar-right">{right}</div>
        </>
      )}
    </div>
  );
}
