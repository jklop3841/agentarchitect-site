import Image from "next/image";

type StripImage = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
};

type ImageStripProps = {
  images: StripImage[];
  variant?: "large" | "compact";
};

export function ImageStrip({ images, variant = "large" }: ImageStripProps) {
  const trackImages = [...images, ...images];

  return (
    <div className={`image-strip image-strip--${variant}`}>
      <div className="image-strip__track">
        {trackImages.map((image, index) => {
          const isDuplicate = index >= images.length;

          return (
            <a
              key={`${image.src}-${index}`}
              href={image.src}
              target="_blank"
              rel="noreferrer"
              className="image-strip__item"
              tabIndex={isDuplicate ? -1 : 0}
              aria-hidden={isDuplicate}
            >
              <span className="image-strip__media">
                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 980px) 78vw, 34vw" />
              </span>
              {(image.title || image.caption) && (
                <span className="image-strip__body">
                  {image.title && <strong>{image.title}</strong>}
                  {image.caption && <span>{image.caption}</span>}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
