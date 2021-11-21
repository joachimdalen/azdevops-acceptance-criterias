export interface PageWrapperProps {
  children: React.ReactElement | React.ReactElement[];
}
const PageWrapper = ({ children }: PageWrapperProps): React.ReactElement => {
  return <div className="page-content padding-16 flex-grow">{children}</div>;
};
export default PageWrapper;
