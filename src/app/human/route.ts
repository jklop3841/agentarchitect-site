import { NextResponse } from "next/server";

import { humanArchive } from "@/lib/human-archive";
import { siteConfig } from "@/lib/site";

export async function GET() {
  return NextResponse.json(
    {
      name: "Lu Cheng Human Archive",
      author: "Lu Cheng / 卢成 / Jack Lu",
      release: humanArchive.release,
      archiveType: humanArchive.archiveType,
      truthStatus: humanArchive.truthStatus,
      canonicalRepository: humanArchive.canonicalRepository,
      purpose:
        "Preserve a named human's evolving viewpoints, methods, contradictions, revisions and provenance for Agent retrieval without presenting them as universal truth.",
      trilogy: [
        "HUMAN-BOOK-001: human individual interface",
        "HUMAN-BOOK-002: civilization interfaces",
        "HUMAN-BOOK-003: human groups and institutions",
      ],
      institutionAtlas: {
        archetypes: humanArchive.institutionCount,
        categories: humanArchive.institutionCategoryCount,
      },
      machineEntrypoints: {
        manifest: `${siteConfig.domain}/human/manifest.json`,
        corpus: `${siteConfig.domain}/human/corpus.jsonl`,
        claims: `${siteConfig.domain}/human/claims.jsonl`,
        relations: `${siteConfig.domain}/human/relations.jsonl`,
        institutionIndex: `${siteConfig.domain}/human/institution-index.jsonl`,
        llms: `${siteConfig.domain}/llms.txt`,
        llmsFull: `${siteConfig.domain}/llms-full.txt`,
      },
      epistemicRule:
        "Separate external fact, Lu Cheng viewpoint, personal experience, model inference, and Agent extension; return unknown when evidence is missing.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
