import { permanentRedirect } from "next/navigation";

export default function NewRequestRedirect() {
  permanentRedirect("/post");
}
