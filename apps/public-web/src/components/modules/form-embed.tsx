'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { ModuleComponentProps } from '@/types/template';
import type { FormDefinition, FormField } from '@/types/content';

interface FieldErrors {
  [fieldId: string]: string;
}

export function FormEmbedModule({ config, moduleKey }: ModuleComponentProps) {
  const slug = (config?.slug as string) ?? '';

  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [values, setValues] = useState<Record<string, string | string[] | boolean>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadForm() {
      try {
        const response = await fetch(`/api/forms/${slug}`);
        if (response.ok) {
          const data: FormDefinition = await response.json();
          if (!cancelled) {
            setFormDef(data);
            const initial: Record<string, string | string[] | boolean> = {};
            for (const field of data.fields) {
              if (field.fieldType === 'CHECKBOX' || field.fieldType === 'CONSENT') {
                initial[field.id] = false;
              } else if (field.fieldType === 'MULTI_SELECT') {
                initial[field.id] = [];
              } else {
                initial[field.id] = '';
              }
            }
            setValues(initial);
          }
        }
      } catch {
        // Form not available
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadForm();
    return () => { cancelled = true; };
  }, [slug]);

  const handleChange = useCallback((fieldId: string, value: string | string[] | boolean) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (prev[fieldId]) {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      }
      return prev;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDef || submitting) return;

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`/api/forms/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: values }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        if (data.errors && typeof data.errors === 'object') {
          setErrors(data.errors as FieldErrors);
        } else if (data.message) {
          setErrors({ _form: data.message });
        }
      }
    } catch {
      setErrors({ _form: 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div data-module={moduleKey} data-module-type="FORM_EMBED" aria-busy="true" className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading form...</span>
      </div>
    );
  }

  if (!slug || !formDef) {
    return (
      <div data-module={moduleKey} data-module-type="FORM_EMBED" className="py-12 text-center">
        <p className="text-muted-foreground">Form not available.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div
        data-module={moduleKey}
        data-module-type="FORM_EMBED"
        role="status"
        aria-live="polite"
        className="mx-auto max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="mt-4 text-lg font-medium text-emerald-800">
          {formDef.successMessage ?? 'Form submitted successfully'}
        </p>
      </div>
    );
  }

  const sortedFields = [...formDef.fields].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div data-module={moduleKey} data-module-type="FORM_EMBED" className="mx-auto max-w-lg">
      <div className="rounded-xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {formDef.title && (
          <h2 className="text-xl font-bold text-card-foreground">{formDef.title}</h2>
        )}
        {formDef.description && (
          <p className="mt-2 text-sm text-muted-foreground">{formDef.description}</p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {errors._form && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
              {errors._form}
            </div>
          )}

          {sortedFields.map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              error={errors[field.id]}
              onChange={handleChange}
            />
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting...' : (formDef.submitButtonText ?? 'Submit')}
          </button>
        </form>
      </div>
    </div>
  );
}


// --- Field Renderer ---

interface FormFieldRendererProps {
  field: FormField;
  value: string | string[] | boolean | undefined;
  error?: string;
  onChange: (fieldId: string, value: string | string[] | boolean) => void;
}

function FormFieldRenderer({ field, value, error, onChange }: FormFieldRendererProps) {
  const fieldId = `form-field-${field.id}`;
  const errorId = `${fieldId}-error`;

  if (field.fieldType === 'HIDDEN') {
    return (
      <input
        type="hidden"
        id={fieldId}
        name={field.id}
        value={(value as string) ?? ''}
      />
    );
  }

  return (
    <div>
      {field.fieldType !== 'CHECKBOX' && field.fieldType !== 'CONSENT' && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.isRequired && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
        </label>
      )}

      {renderControl(field, fieldId, value, error, errorId, onChange)}

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function renderControl(
  field: FormField,
  fieldId: string,
  value: string | string[] | boolean | undefined,
  error: string | undefined,
  errorId: string,
  onChange: (fieldId: string, value: string | string[] | boolean) => void
) {
  const baseInputClass =
    'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary' +
    (error ? ' border-destructive' : ' border-border hover:border-foreground/30');

  switch (field.fieldType) {
    case 'TEXT':
      return (
        <input
          id={fieldId}
          type="text"
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClass}
        />
      );

    case 'TEXTAREA':
      return (
        <textarea
          id={fieldId}
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          rows={4}
          className={baseInputClass + ' resize-y'}
        />
      );

    case 'EMAIL':
      return (
        <input
          id={fieldId}
          type="email"
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClass}
        />
      );

    case 'PHONE':
      return (
        <input
          id={fieldId}
          type="tel"
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClass}
        />
      );

    case 'NUMBER':
      return (
        <input
          id={fieldId}
          type="number"
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClass}
        />
      );

    case 'DATE':
      return (
        <input
          id={fieldId}
          type="date"
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClass}
        />
      );

    case 'SELECT':
      return (
        <select
          id={fieldId}
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInputClass}
        >
          <option value="">{field.placeholder ?? 'Select an option'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'MULTI_SELECT':
      return (
        <select
          id={fieldId}
          multiple
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          value={(value as string[]) ?? []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
            onChange(field.id, selected);
          }}
          className={baseInputClass + ' min-h-[100px]'}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'RADIO':
      return (
        <fieldset aria-describedby={error ? errorId : undefined}>
          <legend className="sr-only">{field.label}</legend>
          <div className="space-y-2.5">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  required={field.isRequired}
                  checked={(value as string) === opt.value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="h-4 w-4 border-border text-primary focus:ring-2 focus:ring-ring/30"
                />
                <span className="text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );

    case 'CHECKBOX':
      return (
        <label htmlFor={fieldId} className="flex items-center gap-2.5 text-sm cursor-pointer">
          <input
            id={fieldId}
            type="checkbox"
            required={field.isRequired}
            aria-required={field.isRequired}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            checked={!!value}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
          />
          <span className="text-foreground">
            {field.label}
            {field.isRequired && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
          </span>
        </label>
      );

    case 'CONSENT':
      return (
        <label htmlFor={fieldId} className="flex items-start gap-2.5 text-sm cursor-pointer">
          <input
            id={fieldId}
            type="checkbox"
            required={field.isRequired}
            aria-required={field.isRequired}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            checked={!!value}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
          />
          <span className="text-foreground">
            {field.label}
            {field.isRequired && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
          </span>
        </label>
      );

    case 'FILE_UPLOAD':
      return (
        <input
          id={fieldId}
          type="file"
          required={field.isRequired}
          aria-required={field.isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            const file = e.target.files?.[0];
            onChange(field.id, file?.name ?? '');
          }}
          className="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 file:cursor-pointer file:transition-colors"
        />
      );

    default:
      return null;
  }
}
