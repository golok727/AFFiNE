import {
  DatabaseBlockDataSource,
  DataViewExtension,
} from '@blocksuite/affine/blocks/database';
import type { ExtensionType } from '@blocksuite/affine/store';

import { AffineDatabaseDVExtensions } from '../../database-block';
import { propertiesPresets } from '../../database-block/properties';

export const AffineDatabaseExtensions = AffineDatabaseDVExtensions.map(
  extension => DataViewExtension(extension)
);

export function patchDatabaseBlockConfigService(): ExtensionType {
  // TODO(golok727): remove
  DatabaseBlockDataSource.externalProperties.value = propertiesPresets;
  return {
    setup(di) {
      AffineDatabaseExtensions.forEach(extension => extension.setup(di));
    },
  };
}
