import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../common/components/ui/tabs';
import { OpenSourceBanner } from './components/OpenSourceBanner';
import { PackageList } from './components/PackageList';
import { NPM_PACKAGES, PYTHON_PACKAGES } from './data';

export function OpenSource() {
  return (
    <PageWrapper pageTitle="Open Source">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <OpenSourceBanner packageCount={NPM_PACKAGES.length + PYTHON_PACKAGES.length} />
        <Tabs defaultValue="npm" className="gap-4">
          <TabsList>
            <TabsTrigger value="npm">
              Frontend (npm)
              <span className="text-muted-foreground tabular-nums">{NPM_PACKAGES.length}</span>
            </TabsTrigger>
            <TabsTrigger value="python">
              Backend (Python)
              <span className="text-muted-foreground tabular-nums">{PYTHON_PACKAGES.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="npm">
            <PackageList packages={NPM_PACKAGES} indirectTitle="Transitive & build tooling" />
          </TabsContent>
          <TabsContent value="python">
            <PackageList packages={PYTHON_PACKAGES} indirectTitle="Transitive dependencies" />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
