#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * scripts/create-module.js  (npm run make)
 *
 * Scaffolds a new module (an HRMS entity, a CRM entity, anything) using
 * tsyringe dependency injection and the BaseRepository / BaseService /
 * BaseController / buildCrudRouter pattern.
 *
 * Usage:
 *   npm run make
 *   npm run make -- <group> <entity>
 */

function cleanInput(str) {
  return (str || '').replace(/[\/\\]+/g, '').trim();
}

function toPascalCase(input) {
  const clean = cleanInput(input);
  return clean.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, (c) => c.toUpperCase());
}

function toCamelCase(input) {
  const pascal = toPascalCase(input);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(input) {
  const clean = cleanInput(input);
  return clean
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

function toKebabCase(input) {
  return toSnakeCase(input).replace(/_/g, '-');
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));

  let moduleGroup = args[0];
  let entityName = args[1];
  let tenantScoped = !flags.includes('--no-tenant');
  let softDelete = !flags.includes('--no-soft-delete');
  let createSchema = flags.includes('--schema');

  if (!moduleGroup || !entityName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'moduleGroup',
        message: 'Module group / package (e.g. hrms, crm, inventory):',
        when: !moduleGroup,
        validate: (v) => (v.trim().length > 0 ? true : 'Required'),
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'Entity name, singular, PascalCase (e.g. Payroll, Invoice, Lead):',
        when: !entityName,
        validate: (v) => (v.trim().length > 0 ? true : 'Required'),
      },
      {
        type: 'confirm',
        name: 'createSchema',
        message: 'Generate a new database schema file?',
        default: false,
        when: !flags.includes('--schema') && !flags.includes('--no-schema'),
      },
      {
        type: 'confirm',
        name: 'tenantScoped',
        message: 'Does this entity belong to a tenant (tenantId column + scoping)?',
        default: true,
        when: !flags.includes('--tenant') && !flags.includes('--no-tenant'),
      },
      {
        type: 'confirm',
        name: 'softDelete',
        message: 'Enable soft delete (deletedAt column)?',
        default: true,
        when: !flags.includes('--soft-delete') && !flags.includes('--no-soft-delete'),
      },
    ]);

    moduleGroup = moduleGroup || answers.moduleGroup;
    entityName = entityName || answers.entityName;
    if (answers.createSchema !== undefined) createSchema = answers.createSchema;
    if (answers.tenantScoped !== undefined) tenantScoped = answers.tenantScoped;
    if (answers.softDelete !== undefined) softDelete = answers.softDelete;
  }

  const group = toKebabCase(moduleGroup);
  const Entity = toPascalCase(entityName);
  const entity = toCamelCase(entityName); // also the tokens.ts MODULE_DEFINITIONS key
  const entitySnake = toSnakeCase(entityName);
  const tableName = `${entitySnake}s`;
  const permissionKey = `${group}.${entitySnake}`;

  const moduleDir = path.resolve(process.cwd(), 'src/modules', group, entitySnake.replace(/_/g, '-'));
  fs.mkdirSync(moduleDir, { recursive: true });

  const files = {};

  // --- Schema -------------------------------------------------------------
  if (createSchema) {
    const schemaDir = path.resolve(process.cwd(), 'src/database/schema/modules', group);
    fs.mkdirSync(schemaDir, { recursive: true });

    files[`${schemaDir}/${entitySnake}.schema.ts`] =
      `import { pgTable, varchar, text, bigint } from 'drizzle-orm/pg-core';
import { idColumn, timestamps, isActiveColumn } from '@/database/schema/core/_shared.columns.js';
${tenantScoped ? "import { tenantsTable } from '@/database/schema/core/multi-tenancy.schema.js';\n" : ''}
/**
 * Database table definition for ${Entity}s.
 * Add custom columns, relations, and indexes below.
 */
export const ${entity}sTable = pgTable('${tableName}', {
  id: idColumn(),
${tenantScoped ? "  tenantId: bigint('tenant_id', { mode: 'number' }).notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),\n" : ''}  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  isActive: isActiveColumn(),
${softDelete ? '  ...timestamps,\n' : '  ...timestamps, // includes deletedAt for soft delete\n'}});

export type ${Entity} = typeof ${entity}sTable.$inferSelect;
export type New${Entity} = typeof ${entity}sTable.$inferInsert;
`;
  }

  const repoGenerics = createSchema ? `<typeof ${entity}sTable, ${Entity}, New${Entity}>` : `<any, any, any>`;
  const repoSuper = createSchema ? `${entity}sTable` : `null as any`;
  const serviceGenerics = createSchema ? `<${Entity}, New${Entity}>` : `<any, any>`;
  const controllerGenerics = createSchema ? `<${Entity}, New${Entity}>` : `<any, any>`;
  const schemaImport = createSchema
    ? `import { ${entity}sTable, type ${Entity}, type New${Entity} } from '@/database/schema/modules/${group}/${entitySnake}.schema.js';\n`
    : '';
  const schemaTypeImport = createSchema
    ? `import type { ${Entity}, New${Entity} } from '@/database/schema/modules/${group}/${entitySnake}.schema.js';\n`
    : '';

  // --- Repository -----------------------------------------------------------
  files[`${moduleDir}/${entitySnake}.repository.ts`] = `import { injectable } from 'tsyringe';
${schemaImport}import { BaseRepository } from '@/core/base/base.repository.js';

/**
 * Data access repository for ${Entity}.
 * Extends BaseRepository for automatic CRUD, pagination, and tenant scoping.
 * Add custom Drizzle database queries and complex data operations below.
 */
@injectable()
export class ${Entity}Repository extends BaseRepository${repoGenerics} {
  constructor() {
    super(${repoSuper});
  }

  // Add custom database queries here, e.g.:
  // async findByName(name: string) {
  //   return this.findOne(eq((this.table as any).name, name));
  // }
}
`;

  // --- Service --------------------------------------------------------------
  files[`${moduleDir}/${entitySnake}.service.ts`] = `import { inject, injectable } from 'tsyringe';
import { BaseService } from '@/core/base/base.service.js';
${schemaTypeImport}import { ${Entity}Repository } from './${entitySnake}.repository.js';

/**
 * Business logic service for ${Entity}.
 * Extends BaseService for default CRUD orchestration over BaseRepository.
 * Add domain rules, external integrations, transactions, and event emission below.
 */
@injectable()
export class ${Entity}Service extends BaseService${serviceGenerics} {
  constructor(@inject(${Entity}Repository) ${entity}Repository: ${Entity}Repository) {
    super(${entity}Repository, '${Entity}');
  }

  // Add domain business logic and custom service methods here
}
`;

  // --- Controller -----------------------------------------------------------
  files[`${moduleDir}/${entitySnake}.controller.ts`] = `import { inject, injectable } from 'tsyringe';
import { BaseController } from '@/core/base/base.controller.js';
${schemaTypeImport}import { ${Entity}Service } from './${entitySnake}.service.js';

/**
 * HTTP controller for ${Entity}.
 * Extends BaseController for standard list, getById, create, update, and remove actions.
 * Add custom HTTP request handlers and endpoint logic below.
 */
@injectable()
export class ${Entity}Controller extends BaseController${controllerGenerics} {
  constructor(@inject(${Entity}Service) ${entity}Service: ${Entity}Service) {
    super(${entity}Service, '${entitySnake}');
  }

  // Add custom HTTP request handlers here
}
`;

  // --- Validation -------------------------------------------------------------
  files[`${moduleDir}/${entitySnake}.validation.ts`] = `import { z } from 'zod';

/**
 * Request body schema for creating ${Entity}.
 * Add your validation fields below.
 */
export const create${Entity}Schema = z.object({
  // Add required/optional request fields here, e.g.:
  // name: z.string().min(1).max(150),
  // description: z.string().max(1000).optional(),
});

/**
 * Request body schema for updating ${Entity} (partial fields).
 */
export const update${Entity}Schema = create${Entity}Schema.partial();
`;

  // --- Routes -----------------------------------------------------------------
  files[`${moduleDir}/${entitySnake}.routes.ts`] = `import { Router } from 'express';
import { container } from 'tsyringe';
import { buildCrudRouter } from '@/core/base/base.route.js';
import { create${Entity}Schema, update${Entity}Schema } from './${entitySnake}.validation.js';
import { ${Entity}Controller } from './${entitySnake}.controller.js';

const router: Router = Router();
const controller = container.resolve(${Entity}Controller);

/**
 * ${Entity} API routes.
 * Automatically mounts CRUD endpoints via buildCrudRouter:
 * GET / (list), POST / (create), GET /:id, PATCH /:id, DELETE /:id
 * Add custom route definitions below.
 */
router.use(
  '/',
  buildCrudRouter(controller, {
    permissionKey: '${permissionKey}',
    createSchema: create${Entity}Schema as any,
    updateSchema: update${Entity}Schema as any,
  }),
);

// Add custom routes here, e.g.:
// router.get('/custom-endpoint', controller.customHandler);

export default router;
`;
  for (const [filePath, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (fs.existsSync(filePath)) {
      console.log(chalk.yellow(`  skip (exists): ${path.relative(process.cwd(), filePath)}`));
      continue;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(chalk.green(`  created: ${path.relative(process.cwd(), filePath)}`));
  }

  const moduleRelPath = `./${group}/${entitySnake.replace(/_/g, '-')}/${entitySnake}`;

  console.log('\n' + chalk.bold('Next steps:'));
  console.log(
    chalk.cyan(`
1. Export the schema from src/database/schema/index.ts (if schema generated):
     export * from './modules/${group}/${entitySnake}.schema.js';

2. Register the module in modules_catalog (if it's a purchasable, non-core module):
     INSERT INTO modules_catalog (key, name) VALUES ('${group}', '${toPascalCase(group)}');

3. Mount the router in src/modules/index.ts:
     import ${entity}Routes from '${moduleRelPath}.routes.js';
     router.use('/${group}/${toKebabCase(entityName)}s', ${entity}Routes);

4. Seed permissions for this module (permissions table): ${permissionKey}:read / :create / :update / :delete

5. Run: npm run db:generate && npm run db:migrate
`),
  );
}

main().catch((err) => {
  console.error(chalk.red('Module generation failed:'), err);
  process.exit(1);
});
