'use client';

import { FileDown, Printer } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { Card } from '../../common/components/card';
import { translateIssues } from '../../common/domain/validation';
import { useFormAction } from '../../common/hooks/use-form-action';
import { validationError } from '../../common/services/api-error';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { useCatalogByCategory } from '../../catalog/hooks/use-catalog';
import {
  NUMERALS_WITHOUT_INVOICE,
  calculateNetReintegro,
  fieldLabelKey,
  readInteractionData,
  suggestedDocuments,
  validateInteractionForm,
} from '../domain/form-fields';
import { OPERATIONS, isDeclarationType, type InteractionType } from '../domain/interaction';
import { createInteraction } from '../services/interaction.service';
import { InteractionFields } from './interaction-fields';
import { downloadFilledImportPdf } from '../import-pdf';
import { downloadFilledExportPdf } from '../export-pdf';
import { declarationPdfContent, downloadDeclarationPdf } from '../declaration-pdf';

interface Submitted {
  data: Record<string, string>;
  numeralTitle: string | undefined;
}

export function InteractionForm({ type }: Readonly<{ type: InteractionType }>) {
  const { t } = useTranslation();
  const isImport = type === 'formulario-importaciones';
  const isExport = type === 'formulario-exportaciones';
  const isDeclaration = isDeclarationType(type);
  const { category, numeralField } = OPERATIONS[type];
  const catalog = useCatalogByCategory(category);
  const [selectedCode, setSelectedCode] = useState('');
  const [netAmount, setNetAmount] = useState('0.00');
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  // Cambiar la key remonta el formulario: limpia campos, cálculos y numeral tras guardar.
  const [formKey, setFormKey] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const items = useMemo(() => catalog.data ?? [], [catalog.data]);
  const selectedItem = items.find((item) => item.code === selectedCode);
  const documents = selectedCode ? suggestedDocuments(type, selectedCode) : null;

  const submit = useCallback(
    async (values: FormData) => {
      const issues = validateInteractionForm(type, values);
      if (issues.length > 0) throw validationError(translateIssues(issues, t));
      const data = readInteractionData(type, values);
      await createInteraction({ type, data });
      return data;
    },
    [type, t],
  );

  const onSuccess = useCallback(
    (data: Record<string, string>) => {
      setSubmitted({
        data,
        numeralTitle: items.find((item) => item.code === data[numeralField])?.title,
      });
      setFormKey((key) => key + 1);
      setSelectedCode('');
      setNetAmount('0.00');
    },
    [items, numeralField],
  );

  const { handleSubmit, isSubmitting, error, fieldErrors, clearErrors } = useFormAction(submit, {
    onSuccess,
  });

  const canSubmit = !catalog.isLoading && !catalog.error && items.length > 0;

  const downloadForm = async () => {
    if (!submitted) return;
    setIsDownloadingPdf(true);
    setDownloadError(null);
    try {
      if (isImport) {
        await downloadFilledImportPdf(submitted.data);
      } else if (isExport) {
        await downloadFilledExportPdf(submitted.data);
      } else {
        // Hoja propia y no oficial: el anexo DCIP-83 no define una plantilla para estas familias.
        await downloadDeclarationPdf(
          declarationPdfContent(type, submitted.data, submitted.numeralTitle, t),
        );
      }
    } catch {
      // Los errores del generador son técnicos; el usuario siempre ve el mensaje traducido.
      setDownloadError(t('interactions.pdfDownloadFailed'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form
        className="flex flex-col gap-5"
        key={formKey}
        noValidate
        onInput={(event) => {
          if (isExport) setNetAmount(calculateNetReintegro(new FormData(event.currentTarget)));
          if (error) clearErrors();
        }}
        onSubmit={handleSubmit}
      >
        <InteractionFields
          fieldErrors={fieldErrors}
          numeral={{
            items,
            isLoading: catalog.isLoading,
            error: catalog.error,
            value: selectedCode,
            onChange: setSelectedCode,
          }}
          type={type}
        />

        {documents && selectedItem && (
          <Alert title={t('interactions.documentsTitle', { code: selectedCode })} tone="info">
            {documents.length > 0 ? (
              <ul className="list-disc pl-5">
                {documents.map((document) => (
                  <li key={document}>{t(document)}</li>
                ))}
              </ul>
            ) : (
              <p>{t('interactions.noDocuments')}</p>
            )}
            {isExport && NUMERALS_WITHOUT_INVOICE.includes(selectedCode) && (
              <p>{t('interactions.noInvoice')}</p>
            )}
          </Alert>
        )}

        {isExport && (
          <p className="rounded-lg bg-surface-muted p-3 text-foreground">
            {t('interactions.netReintegro')} <strong>USD {netAmount}</strong>
          </p>
        )}
        {error && <Alert>{error}</Alert>}
        {submitted && <Alert tone="success">{t('interactions.saved')}</Alert>}
        {downloadError && <Alert>{downloadError}</Alert>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={!canSubmit} isLoading={isSubmitting} type="submit">
            {isSubmitting ? t('interactions.saving') : t('interactions.save')}
          </Button>
          {submitted && (
            <Button
              isLoading={isDownloadingPdf}
              onClick={() => void downloadForm()}
              variant="outline"
            >
              <FileDown aria-hidden="true" className="size-4" />
              {isDeclaration
                ? t('interactions.downloadDeclaration')
                : t('interactions.downloadForm')}
            </Button>
          )}
        </div>
      </form>

      {submitted && (
        <Card
          aria-label={t('interactions.copyLabel')}
          className="flex flex-col gap-4"
          role="region"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="type-subtitle text-foreground">{t('interactions.summary')}</h2>
            <Button onClick={() => window.print()} variant="outline">
              <Printer aria-hidden="true" className="size-4" />
              {t('interactions.print')}
            </Button>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(submitted.data).map(([key, value]) => {
              const labelKey = fieldLabelKey(type, key);
              return (
                <div key={key}>
                  <dt className="type-label text-muted-foreground">
                    {labelKey ? t(labelKey) : key}
                  </dt>
                  <dd className="break-words text-foreground">{value}</dd>
                </div>
              );
            })}
            {submitted.numeralTitle && (
              <div>
                <dt className="type-label text-muted-foreground">
                  {t('interactions.numeralDescription')}
                </dt>
                <dd className="text-foreground">{submitted.numeralTitle}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}
    </div>
  );
}
