import { DatabaseBlockDataSource } from '@blocksuite/affine/blocks/database';
import type { ExtensionType } from '@blocksuite/affine/store';

import { AffineDatabaseGroupByExtensions } from '../../database-block/group-by';
import { propertiesPresets } from '../../database-block/properties';

export function patchDatabaseBlockConfigService(): ExtensionType {
  //TODO use service
  DatabaseBlockDataSource.externalProperties.value = propertiesPresets;
  return {
    setup: di => {
      di;
    },
  };
}

export const AffineDatabaseExtensions: ExtensionType[] = [
  ...AffineDatabaseGroupByExtensions,
];
