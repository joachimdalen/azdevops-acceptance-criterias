import { MouseEventHandler } from 'react';

interface InternalLinkProps {
  children: React.ReactNode;
  onClick: MouseEventHandler<HTMLAnchorElement> | undefined;
}
const InternalLink = ({ children, onClick }: InternalLinkProps): JSX.Element => {
  return (
    <a className="ac-link" href="#" onClick={onClick}>
      {children}
    </a>
  );
};

export default InternalLink;
