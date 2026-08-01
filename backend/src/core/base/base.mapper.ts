import type { Table } from 'drizzle-orm';
import type { EntityOf, InsertOf } from '../types/mapper.js';
import { stripUndefined } from '../shared/utils/object.util.js';

/**
 * Generic contract every module's mapper implements. Services/controllers
 * depend on THIS interface, not on concrete mapper classes (DIP) - swap
 * `UserMapper` for a different implementation (e.g. a locale-aware one)
 * without touching UserService.
 */
export interface IMapper<
  TTable extends Table,
  TResponseDto,
  TCreateDto,
  TUpdateDto = Partial<TCreateDto>,
> {
  toResponse(entity: EntityOf<TTable>): TResponseDto;
  toResponseList(entities: EntityOf<TTable>[]): TResponseDto[];
  toInsert(dto: TCreateDto): InsertOf<TTable>;
  toUpdate(dto: TUpdateDto): Partial<InsertOf<TTable>>;
}

/**
 * BaseMapper<TTable, TResponseDto, TCreateDto, TUpdateDto>
 * ---------------------------------------------------------
 * One abstract class, reused by every module (100+ in an ERP) to move data
 * across the Entity <-> DTO boundary at the Repository/Service edge.
 *
 * Design rules this class encodes:
 *  - Entities (Drizzle rows) NEVER leave the Service layer. Controllers
 *    only ever see DTOs. The mapper is the single seam where that
 *    conversion happens, so "we added a column, did we leak it to the
 *    API?" is a one-file audit (grep for `extends BaseMapper`), not a
 *    codebase-wide one.
 *  - `toResponse` is the only method a concrete mapper is FORCED to write.
 *    Insert/update mapping default to "camelCase DTO field names already
 *    match camelCase column names, minus undefined keys" (true for the
 *    vast majority of modules), so a module with no special transform
 *    logic needs a 3-line mapper.
 *  - Everything is generic over the Drizzle *table*, not a hand-copied
 *    interface, so `$inferSelect`/`$inferInsert` stay the single source of
 *    truth for shape. Add a column to the schema -> every mapper's
 *    generic types update, TS flags anywhere a required field isn't
 *    mapped. No drift between DB and DTOs.
 *
 * Override `toInsert` / `toUpdate` only when a module needs real
 * transform logic (hashing a password, computing a slug, splitting a
 * composite field, dropping a client-supplied field that must never be
 * settable). See UserMapper for a worked example of both.
 */
export abstract class BaseMapper<
  TTable extends Table,
  TResponseDto,
  TCreateDto extends object = Partial<InsertOf<TTable>>,
  TUpdateDto extends object = Partial<TCreateDto>,
> implements IMapper<TTable, TResponseDto, TCreateDto, TUpdateDto> {
  /** The single method every concrete mapper MUST implement: entity -> API-safe DTO. */
  abstract toResponse(entity: EntityOf<TTable>): TResponseDto;

  toResponseList(entities: EntityOf<TTable>[]): TResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  /**
   * CreateDto -> Drizzle insert shape. Default: pass the DTO through as-is
   * (works whenever the create payload's fields are a subset of the
   * table's insertable columns with matching names/types - the common
   * case). Override to hash passwords, inject tenant/audit columns the
   * client should never set directly, etc.
   */
  toInsert(dto: TCreateDto): InsertOf<TTable> {
    return dto as unknown as InsertOf<TTable>;
  }

  /**
   * UpdateDto -> partial Drizzle set() shape. Default strips `undefined`
   * keys so a PATCH body that omits a field doesn't null it out, while
   * still allowing an explicit `null` through. Override for the same
   * reasons as toInsert.
   */
  toUpdate(dto: TUpdateDto): Partial<InsertOf<TTable>> {
    return stripUndefined(dto) as unknown as Partial<InsertOf<TTable>>;
  }
}
