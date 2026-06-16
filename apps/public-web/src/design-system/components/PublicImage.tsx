interface PublicImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill';
  rounded?: boolean;
}

/**
 * PublicImage — optimized image with required alt text, lazy loading, responsive sizing.
 * alt text is mandatory per accessibility requirements.
 */
export function PublicImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  objectFit = 'cover',
  rounded = false,
}: PublicImageProps) {
  const objectFitClass =
    objectFit === 'cover'
      ? 'object-cover'
      : objectFit === 'contain'
      ? 'object-contain'
      : 'object-fill';

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={[
        objectFitClass,
        rounded ? 'rounded-[var(--public-radius)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      decoding="async"
    />
  );
}
