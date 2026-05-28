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
  return (
    <div className={`image-strip image-strip--${variant}`}>
      {images.map((image) => (
        <a key={image.src} href={image.src} target="_blank" rel="noreferrer" className="image-strip__item">
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
      ))}
    </div>
  );
}
