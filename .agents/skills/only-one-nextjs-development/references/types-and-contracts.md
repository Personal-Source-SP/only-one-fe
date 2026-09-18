# Types & Contracts Reference

## Type and Interface Design Standards

- ✅ **Location & Barrel Exports**:
  - Encapsulate type definitions inside the `types/` folder of the feature (`types/<feature>.type.ts`) and re-export via `types/index.ts`.
  - All supporting subdirectories (`types/`, `constants/`, `enums/`, `components/`, `utils/`) MUST provide an `index.ts` barrel.
  - Consumers import directly from directory barrels: `import type { IDataProvider, IDataProviderFormValues } from "./types"`.
  - ❌ **NEVER** declare domain/entity/form `type` or `interface` definitions directly inside `page.tsx` or `components/` files.

- ✅ **Field Metadata Standard (`IFieldMetadata`)**:
  - Every CRUD route MUST define its field properties using `IFieldMetadata` from `@/interfaces` with `FormRuleType`:
  ```typescript
  import type { IFieldMetadata } from '@/interfaces';
  import { FormRuleType } from '@/utilities';

  export const FEATURE_FIELDS = {
      NAME: {
          key: 'name',
          label: 'Tên đối tượng',
          table: {
              title: 'Tên',
              width: '30%',
              sorter: true,
              ellipsis: true,
          },
          form: {
              type: 'input',
              placeholder: 'Nhập tên...',
              rulesConfig: [
                  { type: FormRuleType.Required, message: 'Vui lòng nhập tên' },
                  { type: FormRuleType.Max, max: 255, message: 'Tối đa 255 ký tự' },
              ],
          },
      },
  } as const satisfies Record<string, IFieldMetadata>;
  ```

- ✅ **Entity Model Pattern (`IAbstract`)**:
  - All **Entity Models** (data structures returned from backend API queries) MUST extend `IAbstract` from `@/interfaces` (which provides `id`, `createdAt`, `updatedAt`, `deletedAt`):
  ```typescript
  import type { IAbstract } from '@/interfaces';

  export interface IDataProvider extends IAbstract {
      name: string;
      baseUrl: string;
      identifier: string;
  }
  ```

- ✅ **FormValues Interface Pattern**:
  - Dedicated `I<Entity>FormValues` interfaces model the shape of form inputs for `<ListContainer>` / `useCustomModalForm`:
  ```typescript
  export interface IDataProviderFormValues {
      name: string;
      baseUrl: string;
      identifier: string;
  }
  ```

- ✅ **Strict TypeScript Typing**:
  - NEVER use `any`. Specify strict type definitions for component props, form values (`IFormValues`), mutation payloads, and API response contracts.
