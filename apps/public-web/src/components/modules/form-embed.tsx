'use client';

import { useState, useEffect, useCallback } from 'react';
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
            // Initialize default values
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
    // Clear error on change
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
      <div data-module={moduleKey} data-module-type="FORM_EMBED" aria-busy="true">
        <p>Loading form...</p>
      </div>
    );
  }

  if (!slug || !formDef) {
    return (
      <div data-module={moduleKey} data-module-type="FORM_EMBED">
        <p>Form not available.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div data-module={moduleKey} data-module-type="FORM_EMBED" role="status" aria-live="polite">
        <p className="text-green-700 font-medium">
          {formDef.successMessage ?? 'Form submitted successfully'}
        </p>
      </div>
    );
  }

  const sortedFields = [...formDef.fields].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div data-module={moduleKey} data-module-type="FORM_EMBED">
      {formDef.title && <h2 className="text-xl font-semibold mb-2">{formDef.title}</h2>}
      {formDef.description && <p className="text-gray-600 mb-4">{formDef.description}</p>}

      <form onSubmit={handleSubmit} noValidate>
        {errors._form && (
          <div className="mb-4 text-sm text-red-600" role="alert">
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
          className="mt-4 rounded bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : (formDef.submitButtonText ?? 'Submit')}
        </button>
      </form>
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
    <div className="mb-4">
      {field.fieldType !== 'CHECKBOX' && field.fieldType !== 'CONSENT' && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.isRequired && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      {renderControl(field, fieldId, value, error, errorId, onChange)}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
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
    'w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200' +
    (error ? ' border-red-500' : ' border-gray-300 focus:border-blue-500');

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
          className={baseInputClass}
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
          className={baseInputClass}
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
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  required={field.isRequired}
                  checked={(value as string) === opt.value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="focus:ring-2 focus:ring-blue-200"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      );

    case 'CHECKBOX':
      return (
        <label htmlFor={fieldId} className="flex items-center gap-2 text-sm">
          <input
            id={fieldId}
            type="checkbox"
            required={field.isRequired}
            aria-required={field.isRequired}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            checked={!!value}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="focus:ring-2 focus:ring-blue-200"
          />
          {field.label}
          {field.isRequired && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      );

    case 'CONSENT':
      return (
        <label htmlFor={fieldId} className="flex items-start gap-2 text-sm">
          <input
            id={fieldId}
            type="checkbox"
            required={field.isRequired}
            aria-required={field.isRequired}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            checked={!!value}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="mt-0.5 focus:ring-2 focus:ring-blue-200"
          />
          <span>
            {field.label}
            {field.isRequired && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
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
          className="text-sm"
        />
      );

    default:
      return null;
  }
}
