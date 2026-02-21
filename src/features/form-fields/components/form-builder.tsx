"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { type Control, useFieldArray, useForm } from "react-hook-form";
import type { FormField } from "@/core/db/schema";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { useCreateFormField } from "../hooks/use-create-form-field";
import { useDeleteFormField } from "../hooks/use-delete-form-field";
import { useReorderFormFields } from "../hooks/use-reorder-form-fields";
import { useUpdateFormField } from "../hooks/use-update-form-field";
import {
  type CreateFormFieldInput,
  createFormFieldSchema,
  type FieldType,
  fieldTypeLabels,
  fieldTypes,
} from "../schemas";

// Componente para gerenciar opções do select
type SelectOptionsManagerProps = {
  control: Control<CreateFormFieldInput>;
};

function SelectOptionsManager({ control }: SelectOptionsManagerProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options.options",
  });

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <FormLabel>Opções do Select</FormLabel>
          <FormDescription className="mt-1">
            Adicione as opções disponíveis para seleção
          </FormDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: "", label: "" })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Opção
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma opção adicionada
        </p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormFieldComponent
                control={control}
                name={`options.options.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="valor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormFieldComponent
                control={control}
                name={`options.options.${index}.label`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Texto exibido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente interno para itens arrastáveis
type SortableFieldItemProps = {
  field: FormField;
  onEdit: (field: FormField) => void;
  onDelete: (field: FormField) => void;
};

function SortableFieldItem({
  field,
  onEdit,
  onDelete,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border rounded-lg bg-card"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.label}</span>
          {field.required && (
            <span className="text-xs text-destructive">*</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{fieldTypeLabels[field.type as FieldType]}</span>
          <span>•</span>
          <code className="text-xs bg-muted px-1 rounded">{field.name}</code>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onEdit(field)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(field)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

type FormBuilderProps = {
  serviceId: string;
  fields: FormField[];
};

export function FormBuilder({ serviceId, fields }: FormBuilderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<FormField | null>(null);
  const [localFields, setLocalFields] = useState<FormField[]>(fields);

  // Sincronizar localFields quando fields mudar
  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const { mutate: createField, isPending: isCreating } = useCreateFormField();
  const { mutate: updateField, isPending: isUpdating } = useUpdateFormField();
  const { mutate: deleteField, isPending: isDeleting } = useDeleteFormField();
  const { mutate: reorderFields } = useReorderFormFields();

  // Configuração de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handler do drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setLocalFields((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Atualizar a ordem no backend
      const fieldOrders = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      reorderFields({
        serviceId,
        fieldOrders,
      });

      return newItems;
    });
  };

  const form = useForm<CreateFormFieldInput>({
    resolver: zodResolver(createFormFieldSchema),
    defaultValues: {
      serviceId,
      name: "",
      label: "",
      placeholder: "",
      type: "text",
      required: false,
      order: localFields.length,
      options: {
        options: [],
      },
    },
  });

  const selectedType = form.watch("type");

  const openCreateDialog = () => {
    form.reset({
      serviceId,
      name: "",
      label: "",
      placeholder: "",
      type: "text",
      required: false,
      order: fields.length,
      options: {
        options: [],
      },
    });
    setEditingField(null);
    setDialogOpen(true);
  };

  const openEditDialog = (field: FormField) => {
    const fieldOptions = field.options as {
      options?: Array<{ value: string; label: string }>;
    } | null;
    form.reset({
      serviceId: field.serviceId,
      name: field.name,
      label: field.label,
      placeholder: field.placeholder || "",
      type: field.type as FieldType,
      required: field.required,
      order: field.order,
      options: fieldOptions || { options: [] },
    });
    setEditingField(field);
    setDialogOpen(true);
  };

  const handleSubmit = (data: CreateFormFieldInput) => {
    if (editingField) {
      updateField(
        { ...data, id: editingField.id },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingField(null);
          },
        },
      );
    } else {
      createField(data, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (fieldToDelete) {
      deleteField(fieldToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setFieldToDelete(null);
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Campos do Formulário</h3>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Campo
        </Button>
      </div>

      {localFields.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum campo adicionado ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em &quot;Adicionar Campo&quot; para começar a construir o
            formulário.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {localFields.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  onEdit={openEditDialog}
                  onDelete={(field) => {
                    setFieldToDelete(field);
                    setDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dialog de criação/edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Editar Campo" : "Novo Campo"}
            </DialogTitle>
            <DialogDescription>
              Configure as propriedades do campo do formulário.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormFieldComponent
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome Completo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Texto exibido para o usuário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormFieldComponent
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Técnico</FormLabel>
                    <FormControl>
                      <Input placeholder="fullName" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único (sem espaços ou caracteres especiais)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormFieldComponent
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Campo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {fieldTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormFieldComponent
                control={form.control}
                name="placeholder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placeholder</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormFieldComponent
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Obrigatório</FormLabel>
                      <FormDescription>
                        Campo deve ser preenchido
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {selectedType === "select" && (
                <SelectOptionsManager control={form.control} />
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingField ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o campo &quot;
              {fieldToDelete?.label}
              &quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
