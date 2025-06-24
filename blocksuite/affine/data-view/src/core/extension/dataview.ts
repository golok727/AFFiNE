import { type Container, createIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';

import { DataSourceScope } from '../data-source/consts.js';
import { type DataSource } from '../data-source/source';

export interface ContainerLike {
  add: Container['add'];
  addImpl: Container['addImpl'];
  override: Container['override'];
  scope: Container['scope'];
  addValue: Container['addValue'];
}

export interface DataViewExtensionContext {
  // scoped to dataview
  di: ContainerLike;
  dataSource: DataSource;
}

export function createDataViewExtensionContext(
  container: Container,
  dataSource: DataSource
): DataViewExtensionContext {
  return {
    di: createDataSourceScopedContainer(container),
    dataSource,
  };
}

function createDataSourceScopedContainer(container: Container): ContainerLike {
  const scopedContainer = container.scope(DataSourceScope);
  return {
    ...scopedContainer,
    addValue(identifier, value, options): void {
      return container.addValue(identifier, value, {
        ...options,
        scope: DataSourceScope,
      });
    },
  };
}

export interface DataViewExtensionType {
  name?: string;
  setup(di: DataViewExtensionContext): void;
}

let id = 1;
export function DataViewExtension(
  extension: DataViewExtensionType
): ExtensionType {
  return {
    setup(di) {
      di.addValue(
        DataViewExtensionIdentifier(
          `DataViewExtension(${id++}, ${extension.name ?? 'unknown'})`
        ),
        extension
      );
    },
  };
}

export const DataViewExtensionIdentifier =
  createIdentifier<DataViewExtensionType>('DataViewExtension');
