import archiver from "archiver";
import type { Meeting, User, Version, Workspace } from "./types";
import type { ExtractionData } from "../extraction/types";
import type { TranscriptSegment } from "../transcription/types";
import { generateComplianceNotePDF } from "./pdf";
import { generateEvidenceMapCSV, generateVersionHistoryCSV, generateInteractionLogCSV } from "./csv";
import { generateTranscriptTXT } from "./txt";

interface ExportData {
  meeting: Meeting & { finalizedBy?: User | null };
  extraction: ExtractionData;
  transcript: { segments: TranscriptSegment[] } | null;
  versions: Version[];
  workspace: Workspace;
}

/**
 * Generate complete audit pack as ZIP buffer
 */
export async function generateAuditPack(data: ExportData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Maximum compression
      });

      const buffers: Buffer[] = [];
      archive.on("data", (chunk: Buffer) => buffers.push(chunk));
      archive.on("end", () => {
        const zipBuffer = Buffer.concat(buffers);
        resolve(zipBuffer);
      });
      archive.on("error", (err) => {
        console.error("Archiver error:", err);
        reject(err);
      });

      const { meeting, extraction, transcript, versions, workspace } = data;

      // Sanitize filename components
      const sanitizeFilename = (str: string): string => {
        return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      };

      const clientName = sanitizeFilename(meeting.clientName);
      const exportDate = new Date().toISOString().split("T")[0];
      const baseFilename = `${sanitizeFilename(workspace.name)}_${clientName}_${exportDate}`;

      // 1. Generate and add PDF
      try {
        const pdfBuffer = await generateComplianceNotePDF({
          meeting,
          extraction,
          workspaceName: workspace.name,
        });
        archive.append(pdfBuffer, { name: `${baseFilename}_compliance_note.pdf` });
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : "Unknown error"}`);
      }

      // 2. Generate and add Evidence Map CSV
      try {
        const evidenceMapCSV = generateEvidenceMapCSV(extraction);
        archive.append(Buffer.from(evidenceMapCSV, "utf-8"), {
          name: `${baseFilename}_evidence_map.csv`,
        });
      } catch (csvError) {
        console.error("Evidence Map CSV generation error:", csvError);
        throw new Error(`Evidence Map CSV generation failed: ${csvError instanceof Error ? csvError.message : "Unknown error"}`);
      }

      // 3. Generate and add Version History CSV
      try {
        const versionHistoryCSV = generateVersionHistoryCSV(versions);
        archive.append(Buffer.from(versionHistoryCSV, "utf-8"), {
          name: `${baseFilename}_version_history.csv`,
        });
      } catch (csvError) {
        console.error("Version History CSV generation error:", csvError);
        throw new Error(`Version History CSV generation failed: ${csvError instanceof Error ? csvError.message : "Unknown error"}`);
      }

      // 4. Generate and add Transcript TXT
      if (transcript && transcript.segments) {
        try {
          const transcriptTXT = generateTranscriptTXT(transcript.segments);
          archive.append(Buffer.from(transcriptTXT, "utf-8"), {
            name: `${baseFilename}_transcript.txt`,
          });
        } catch (txtError) {
          console.error("Transcript TXT generation error:", txtError);
          throw new Error(`Transcript TXT generation failed: ${txtError instanceof Error ? txtError.message : "Unknown error"}`);
        }
      }

      // 5. Generate and add Interaction Log CSV
      try {
        const interactionLogCSV = generateInteractionLogCSV(meeting, extraction);
        archive.append(Buffer.from(interactionLogCSV, "utf-8"), {
          name: `${baseFilename}_interaction_log.csv`,
        });
      } catch (csvError) {
        console.error("Interaction Log CSV generation error:", csvError);
        throw new Error(`Interaction Log CSV generation failed: ${csvError instanceof Error ? csvError.message : "Unknown error"}`);
      }

      // Finalize the archive
      await archive.finalize();
    } catch (error) {
      console.error("Error in generateAuditPack:", error);
      reject(error);
    }
  });
}

/**
 * Generate export filename
 */
export function generateExportFilename(workspaceName: string, clientName: string): string {
  const sanitize = (str: string): string => {
    return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  };

  const exportDate = new Date().toISOString().split("T")[0];
  return `${sanitize(workspaceName)}_${sanitize(clientName)}_${exportDate}_audit_pack.zip`;
}

