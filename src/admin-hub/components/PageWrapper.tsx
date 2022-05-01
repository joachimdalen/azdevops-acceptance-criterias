import { ISurfaceContext, SurfaceBackground, SurfaceContext } from 'azure-devops-ui/Surface';
import cx from 'classnames';
export interface PageWrapperProps {
  children: React.ReactElement | React.ReactElement[];
}
const PageWrapper = ({ children }: PageWrapperProps): React.ReactElement => {
  return (
    <SurfaceContext.Consumer>
      {({ background }: ISurfaceContext) => (
        <div
          className={cx(
            'page-content padding-16 flex-grow',
            {
              'bolt-page-grey': background === SurfaceBackground.neutral
            },
            {
              'bolt-page-white': background === SurfaceBackground.normal
            }
          )}
        >
          {children}
        </div>
      )}
    </SurfaceContext.Consumer>
  );
};
export default PageWrapper;
