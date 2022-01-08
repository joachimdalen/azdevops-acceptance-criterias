import { SurfaceContext, ISurfaceContext, SurfaceBackground } from 'azure-devops-ui/Surface';

export interface PageWrapperProps {
  children: React.ReactElement | React.ReactElement[];
}
const PageWrapper = ({ children }: PageWrapperProps): React.ReactElement => {
  return (
    <SurfaceContext.Consumer>
      {({ background }: ISurfaceContext) => (
        <div
          className={`page-content padding-16 flex-grow  ${
            (background === SurfaceBackground.neutral && 'bolt-page-grey',
            background === SurfaceBackground.normal && 'bolt-page-white')
          }`}
        >
          {children}
        </div>
      )}
    </SurfaceContext.Consumer>
  );
};
export default PageWrapper;
