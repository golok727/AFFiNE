import { DatabaseBlockDataSource } from '@blocksuite/affine/blocks/database';
import type { ExtensionType } from '@blocksuite/affine/store';

import { AffineDatabaseGroupByExtensions } from '../../database-block/group-by';
import {
  AffineDatabasePropertyExtensions,
  propertiesPresets,
} from '../../database-block/properties';

export const AffineDatabaseExtensions: ExtensionType[] = [
  ...AffineDatabasePropertyExtensions,
  ...AffineDatabaseGroupByExtensions,
];

export function patchDatabaseBlockConfigService(): ExtensionType {
  // TODO(golok727): remove
  DatabaseBlockDataSource.externalProperties.value = propertiesPresets;
  return {
    setup(di) {
      AffineDatabaseExtensions.forEach(extension => extension.setup(di));
    },
  };
}
