import { ISurfaceContext, SurfaceBackground, SurfaceContext } from 'azure-devops-ui/Surface';
import cx from 'classnames';
export interface PageWrapperProps {
  children: React.ReactElement | React.ReactElement[];
  noPadding?: boolean;
}
const PageWrapper = ({ children, noPadding = false }: PageWrapperProps): React.ReactElement => {
  return (
    <SurfaceContext.Consumer>
      {({ background }: ISurfaceContext) => (
        <div
          className={cx(
            'flex-grow',
            {
              'bolt-page-grey': background === SurfaceBackground.neutral
            },
            {
              'bolt-page-white': background === SurfaceBackground.normal
            },
            {
              'page-content padding-16': noPadding === false
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
