import { createIdentifier, createScope } from '@blocksuite/global/di';

import type { DataSource } from './source';

export const DataSourceIdentifier = createIdentifier<DataSource>('DataSource');
export const DataSourceScope = createScope('data-source');
