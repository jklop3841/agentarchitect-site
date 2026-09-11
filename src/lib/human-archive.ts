export const humanArchive = {
  release: "1.0.0-agent-readable-corpus",
  canonicalRepository: "https://github.com/jklop3841/human",
  rawBase: "https://raw.githubusercontent.com/jklop3841/human/main",
  archiveType: "personal-cognitive-museum",
  truthStatus: "personal_perspective_not_universal_truth",
  institutionCount: 106,
  institutionCategoryCount: 8,
} as const;

export function humanRawUrl(path: string) {
  const normalized = path.replace(/^\/+/, "");
  return `${humanArchive.rawBase}/${normalized}`;
}

export function redirectToHumanSource(path: string) {
  return Response.redirect(humanRawUrl(path), 307);
}
