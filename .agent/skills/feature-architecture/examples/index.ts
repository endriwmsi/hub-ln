// features/entities/index.ts
// Public API da feature - ÚNICO ponto de importação externa

// Components
export { EntityForm } from "./components/entity-form";
export { EntityTable } from "./components/entity-table";
export { EntityCard } from "./components/entity-card";

// Hooks
export { useEntities } from "./hooks/use-entities";
export { useEntity } from "./hooks/use-entity";
export { useCreateEntity } from "./hooks/use-create-entity";
export { useUpdateEntity } from "./hooks/use-update-entity";
export { useDeleteEntity } from "./hooks/use-delete-entity";

// Actions
export { createEntity, updateEntity, deleteEntity, getEntities } from "./actions";

// Types
export type { Entity, CreateEntityInput, UpdateEntityInput } from "./types";
