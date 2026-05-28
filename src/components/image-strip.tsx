import Image from "next/image";

type StripImage = {
  src: string;
  alt: string;
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
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 980px) 50vw, 25vw" />
        </a>
      ))}
    </div>
  );
}
