import { createIdentifier } from '@blocksuite/global/di';

import type { DataSource } from './source';

export const DataSourceIdentifier = createIdentifier<DataSource>('DataSource');
