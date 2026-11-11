import type { FieldErrors } from '../../common/domain/api-error';
import { Field } from '../../common/components/field';
import { Input } from '../../common/components/input';
import { Select } from '../../common/components/select';
import { Textarea } from '../../common/components/textarea';
import { useTranslation } from '../../i18n/hooks/use-translation';
import {
  CONTACT_PRODUCT_TYPES,
  type ContactProductType,
  type ContactRequest,
} from '../domain/contact';

interface ContactFieldsProps {
  fieldErrors: FieldErrors;
  defaultType: ContactProductType;
  /** Valores iniciales al editar una solicitud existente. */
  initial?: ContactRequest;
}

/** Campos compartidos por el formulario público y el de edición de "Mis solicitudes". */
export function ContactFields({ fieldErrors, defaultType, initial }: Readonly<ContactFieldsProps>) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={fieldErrors.nombreCompleto} label={t('contact.fields.fullName')} required>
          {(control) => (
            <Input
              {...control}
              autoComplete="name"
              defaultValue={initial?.nombreCompleto}
              maxLength={120}
              name="nombreCompleto"
            />
          )}
        </Field>
        <Field error={fieldErrors.email} label={t('contact.fields.email')} required>
          {(control) => (
            <Input
              {...control}
              autoComplete="email"
              defaultValue={initial?.email}
              maxLength={254}
              name="email"
              type="email"
            />
          )}
        </Field>
        <Field error={fieldErrors.empresa} label={t('contact.fields.company')}>
          {(control) => (
            <Input
              {...control}
              autoComplete="organization"
              defaultValue={initial?.empresa ?? ''}
              maxLength={160}
              name="empresa"
            />
          )}
        </Field>
        <Field error={fieldErrors.telefono} label={t('contact.fields.phone')}>
          {(control) => (
            <Input
              {...control}
              autoComplete="tel"
              defaultValue={initial?.telefono ?? ''}
              maxLength={40}
              name="telefono"
              type="tel"
            />
          )}
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={fieldErrors.tipoProducto} label={t('contact.fields.productType')} required>
          {(control) => (
            <Select
              {...control}
              defaultValue={initial?.tipoProducto ?? defaultType}
              name="tipoProducto"
            >
              {CONTACT_PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`contact.productTypes.${type}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field
          error={fieldErrors.montoEstimado}
          hint={t('contact.fields.estimatedAmountHint')}
          label={t('contact.fields.estimatedAmount')}
        >
          {(control) => (
            <Input
              {...control}
              defaultValue={initial?.montoEstimado ?? ''}
              inputMode="decimal"
              name="montoEstimado"
              type="text"
            />
          )}
        </Field>
      </div>
      <Field
        error={fieldErrors.descripcionCaso}
        label={t('contact.fields.caseDescription')}
        required
      >
        {(control) => (
          <Textarea
            {...control}
            defaultValue={initial?.descripcionCaso}
            maxLength={2000}
            name="descripcionCaso"
            rows={5}
          />
        )}
      </Field>
    </>
  );
}
