import {
  type Container,
  createIdentifier,
  type ServiceProvider,
} from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';

import { type DataSource } from '../data-source/source';

export interface DataViewExtensionContext<
  Source extends DataSource = DataSource,
> {
  di: Container;
  dataSource: Source;
}

export function createDataViewExtensionContext(
  container: Container,
  dataSource: DataSource
): DataViewExtensionContext {
  return {
    di: container,
    dataSource,
  };
}

/**
 *  Dataview Extensions are allows to register a service into a container belonging to a datasource.
 * ```ts
 *
 * const Ext: DataViewExtensionType = {
 *  name: 'MyExtension',
 *  setup({ di, dataSource }) {
 *  // add a service to the data source's container
 *  di.addValue(MyService, new MyService(dataSource));
 *  }
 * }
 *
 * class MyDataSource extends DataSourceBase {
 *  constructor(extensions: DataViewExtensionType[]) {
 *   super(extensions)
 *  }
 * }
 * const dataSource = new MyDataSource([ Ext ]);
 * ```
 */
export type DataViewExtensionType = {
  name?: string;
  setup: (context: DataViewExtensionContext) => void;
};

let id = 1;
/**
 * Helper function to create a `ExtensionType` for a DataViewExtension.
 */
export function DataViewExtension(
  extension: DataViewExtensionType
): ExtensionType {
  return {
    setup(di) {
      di.addValue(
        DataViewExtensionIdentifier(`DataViewExtension(${id++})`),
        extension
      );
    },
  };
}

export function getDataViewExtensions(
  provider: ServiceProvider
): DataViewExtensionType[] {
  return Array.from(provider.getAll(DataViewExtensionIdentifier).values());
}

export const DataViewExtensionIdentifier =
  createIdentifier<DataViewExtensionType>('DataViewExtension');
