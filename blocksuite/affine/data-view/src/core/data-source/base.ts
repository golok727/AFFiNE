import type { ColumnDataType } from '@blocksuite/affine-model';
import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import {
  Container,
  type GeneralServiceIdentifier,
  type ServiceProvider,
} from '@blocksuite/global/di';
import { computed, type ReadonlySignal } from '@preact/signals-core';

import {
  createDataViewExtensionContext,
  type DataViewExtensionType,
} from '../extension/dataview.js';
import { getPropertyManager } from '../extension/property.js';
import type { TypeInstance } from '../logical/type.js';
import type { PropertyMetaConfig } from '../property/property-config.js';
import type { DatabaseFlags } from '../types.js';
import type { ViewConvertConfig } from '../view/convert.js';
import type { DataViewDataType, ViewMeta } from '../view/data-view.js';
import type { ViewManager } from '../view-manager/view-manager.js';
import { DataSourceIdentifier } from './consts.js';
import { CoreDataviewExtensions } from './extensions.js';
import type { DataSource } from './source.js';

export abstract class DataSourceBase implements DataSource {
  propertyTypeCanSet(propertyId: string): boolean {
    return !this.isFixedProperty(propertyId);
  }
  propertyCanDuplicate(propertyId: string): boolean {
    return !this.isFixedProperty(propertyId);
  }
  propertyCanDelete(propertyId: string): boolean {
    return !this.isFixedProperty(propertyId);
  }

  abstract get parentProvider(): ServiceProvider;

  abstract featureFlags$: ReadonlySignal<DatabaseFlags>;

  abstract properties$: ReadonlySignal<string[]>;

  abstract propertyMetas$: ReadonlySignal<PropertyMetaConfig[]>;

  abstract allPropertyMetas$: ReadonlySignal<PropertyMetaConfig[]>;

  abstract readonly$: ReadonlySignal<boolean>;

  abstract rows$: ReadonlySignal<string[]>;

  abstract viewConverts: ViewConvertConfig[];

  abstract viewDataList$: ReadonlySignal<DataViewDataType[]>;

  abstract viewManager: ViewManager;

  abstract viewMetas: ViewMeta[];

  abstract cellValueChange(
    rowId: string,
    propertyId: string,
    value: unknown
  ): void;

  abstract cellValueChange(
    rowId: string,
    propertyId: string,
    value: unknown
  ): void;

  abstract cellValueGet(rowId: string, propertyId: string): unknown;

  cellValueGet$(
    rowId: string,
    propertyId: string
  ): ReadonlySignal<unknown | undefined> {
    return computed(() => this.cellValueGet(rowId, propertyId));
  }

  protected container = new Container();
  protected _provider: ServiceProvider | null = null;

  get propertyManager() {
    return getPropertyManager(this);
  }

  constructor(protected _userExtensions: DataViewExtensionType[] = []) {}

  protected init(init?: (source: this) => void) {
    if (this._provider) {
      throw new Error('DataSource is already initialized.');
    }

    // extensions use this
    this.serviceSet(DataSourceIdentifier, this);

    this._loadDataViewExtensions();

    init?.(this);

    this._provider = this.container.provider(undefined, this.parentProvider);
  }

  private _loadDataViewExtensions() {
    const extensions = [...CoreDataviewExtensions, ...this._userExtensions];
    const context = createDataViewExtensionContext(this.container, this);
    extensions.forEach(extension => {
      extension.setup(context);
    });
  }

  get provider() {
    if (!this._provider) {
      throw new Error(
        'Datasource must be initialized before getting provider.'
      );
    }
    return this._provider;
  }

  serviceGet<T>(key: GeneralServiceIdentifier<T>): T | null {
    return this.provider.getOptional(key) ?? null;
  }

  serviceSet<T>(key: GeneralServiceIdentifier<T>, value: T): void {
    if (this._provider) {
      throw new Error(
        'DataSource is already initialized, cannot set service after initialization.'
      );
    }
    this.container.addValue(key, value);
  }

  abstract propertyAdd(
    insertToPosition: InsertToPosition,
    ops?: {
      type?: string;
      name?: string;
    }
  ): string | undefined;

  abstract propertyDataGet(propertyId: string): Record<string, unknown>;

  propertyDataGet$(
    propertyId: string
  ): ReadonlySignal<Record<string, unknown> | undefined> {
    return computed(() => this.propertyDataGet(propertyId));
  }

  abstract propertyDataSet(
    propertyId: string,
    data: Record<string, unknown>
  ): void;

  abstract propertyDataTypeGet(propertyId: string): TypeInstance | undefined;

  propertyDataTypeGet$(
    propertyId: string
  ): ReadonlySignal<TypeInstance | undefined> {
    return computed(() => this.propertyDataTypeGet(propertyId));
  }

  abstract propertyDelete(id: string): void;

  abstract propertyDuplicate(propertyId: string): string | undefined;

  abstract propertyMetaGet(type: string): PropertyMetaConfig | undefined;

  abstract propertyNameGet(propertyId: string): string;

  propertyNameGet$(propertyId: string): ReadonlySignal<string | undefined> {
    return computed(() => this.propertyNameGet(propertyId));
  }

  abstract propertyNameSet(propertyId: string, name: string): void;

  propertyReadonlyGet(_propertyId: string): boolean {
    return false;
  }

  propertyReadonlyGet$(propertyId: string): ReadonlySignal<boolean> {
    return computed(() => this.propertyReadonlyGet(propertyId));
  }

  abstract propertyTypeGet(propertyId: string): string | undefined;

  propertyTypeGet$(propertyId: string): ReadonlySignal<string | undefined> {
    return computed(() => this.propertyTypeGet(propertyId));
  }

  abstract propertyTypeSet(propertyId: string, type: string): void;

  abstract rowAdd(InsertToPosition: InsertToPosition | number): string;

  abstract rowDelete(ids: string[]): void;

  abstract rowMove(rowId: string, position: InsertToPosition): void;

  abstract viewDataAdd(viewData: DataViewDataType): string;

  abstract viewDataDelete(viewId: string): void;

  abstract viewDataDuplicate(id: string): string;

  abstract viewDataGet(viewId: string): DataViewDataType | undefined;

  viewDataGet$(viewId: string): ReadonlySignal<DataViewDataType | undefined> {
    return computed(() => this.viewDataGet(viewId));
  }

  abstract viewDataMoveTo(id: string, position: InsertToPosition): void;

  abstract viewDataUpdate<ViewData extends DataViewDataType>(
    id: string,
    updater: (data: ViewData) => Partial<ViewData>
  ): void;

  abstract viewMetaGet(type: string): ViewMeta;

  viewMetaGet$(type: string): ReadonlySignal<ViewMeta | undefined> {
    return computed(() => this.viewMetaGet(type));
  }

  abstract viewMetaGetById(viewId: string): ViewMeta | undefined;

  viewMetaGetById$(viewId: string): ReadonlySignal<ViewMeta | undefined> {
    return computed(() => this.viewMetaGetById(viewId));
  }

  fixedProperties$ = computed(() => {
    return this.allPropertyMetas$.value
      .filter(v => v.config.fixed)
      .map(v => v.type);
  });
  fixedPropertySet = computed(() => {
    return new Set(this.fixedProperties$.value);
  });

  protected abstract getNormalPropertyAndIndex(propertyId: string):
    | {
        column: ColumnDataType<Record<string, unknown>>;
        index: number;
      }
    | undefined;

  isFixedProperty(propertyId: string) {
    if (this.fixedPropertySet.value.has(propertyId)) {
      return true;
    }
    const result = this.getNormalPropertyAndIndex(propertyId);
    if (result) {
      return this.fixedPropertySet.value.has(result.column.type);
    }
    return false;
  }
}
