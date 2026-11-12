'use client';

import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { Field } from '../../common/components/field';
import { FileInput } from '../../common/components/file-input';
import { Input } from '../../common/components/input';
import { ModalFooter } from '../../common/components/modal-footer';
import { Select } from '../../common/components/select';
import { Textarea } from '../../common/components/textarea';
import { getApiHost } from '../../common/config';
import { resolveMediaUrl } from '../../common/domain/media-url';
import { useTranslation } from '../../i18n/hooks/use-translation';
import {
  CATALOG_CATEGORIES,
  CATALOG_DIRECTIONS,
  categoryLabel,
  type CatalogItem,
} from '../domain/catalog';
import { IMAGE_MAX_MB, IMAGE_TYPES } from '../domain/catalog-form';
import { useCatalogForm } from '../hooks/use-catalog-form';

interface CatalogFormProps {
  /** Registro a editar; `null` para crear uno nuevo. */
  item: CatalogItem | null;
  onSaved: (saved: CatalogItem) => void;
  onCancel: () => void;
}

export function CatalogForm({ item, onSaved, onCancel }: Readonly<CatalogFormProps>) {
  const { t } = useTranslation();
  const { handleSubmit, isSubmitting, error, fieldErrors, clearErrors } = useCatalogForm(
    item,
    onSaved,
  );
  // La categoría es texto libre en el backend: si el registro usa una no sembrada, se conserva.
  const categories: string[] = [...CATALOG_CATEGORIES];
  if (item && !categories.includes(item.category)) categories.push(item.category);

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onInput={() => {
        if (error) clearErrors();
      }}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={fieldErrors.category} label={t('catalog.form.category')} required>
          {(control) => (
            <Select {...control} defaultValue={item?.category ?? 'importaciones'} name="category">
              {categories.map((value) => (
                <option key={value} value={value}>
                  {categoryLabel(value, t)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field error={fieldErrors.direction} label={t('catalog.form.direction')} required>
          {(control) => (
            <Select {...control} defaultValue={item?.direction ?? 'INGRESOS'} name="direction">
              {CATALOG_DIRECTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`catalog.directions.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field
        error={fieldErrors.code}
        hint={t('catalog.form.codeHint')}
        label={t('catalog.form.code')}
        required
      >
        {(control) => <Input {...control} defaultValue={item?.code} maxLength={40} name="code" />}
      </Field>
      <Field error={fieldErrors.title} label={t('catalog.form.title')} required>
        {(control) => (
          <Input {...control} defaultValue={item?.title} maxLength={250} name="title" />
        )}
      </Field>
      <Field error={fieldErrors.description} label={t('catalog.form.description')} required>
        {(control) => (
          <Textarea
            {...control}
            defaultValue={item?.description}
            maxLength={10000}
            name="description"
          />
        )}
      </Field>
      <Field
        error={fieldErrors.note}
        hint={t('catalog.form.noteHint')}
        label={t('catalog.form.note')}
      >
        {(control) => (
          <Textarea
            {...control}
            defaultValue={item?.note ?? ''}
            maxLength={2000}
            name="note"
            rows={2}
          />
        )}
      </Field>
      <Field
        error={fieldErrors.image}
        hint={`${t('catalog.form.imageHint', { max: IMAGE_MAX_MB })}${item ? ` ${t('catalog.form.imageKeep')}` : ''}`}
        label={t('catalog.form.image')}
      >
        {({ invalid, ...control }) => (
          <FileInput
            {...control}
            accept={IMAGE_TYPES}
            currentImageUrl={item?.imageUrl ? resolveMediaUrl(item.imageUrl, getApiHost()) : null}
            invalid={invalid}
            maxSizeMb={IMAGE_MAX_MB}
            name="image"
          />
        )}
      </Field>
      {error && <Alert>{error}</Alert>}
      <ModalFooter>
        <Button disabled={isSubmitting} onClick={onCancel} variant="outline">
          {t('common.cancel')}
        </Button>
        <Button isLoading={isSubmitting} type="submit">
          {isSubmitting
            ? t('catalog.form.saving')
            : item
              ? t('catalog.form.saveChanges')
              : t('catalog.form.create')}
        </Button>
      </ModalFooter>
    </form>
  );
}
