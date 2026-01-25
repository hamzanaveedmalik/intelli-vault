import { createHash } from "crypto";

export function sha256FromBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function sha256FromResponseBody(body: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!body) {
    throw new Error("Response body is empty");
  }

  const hash = createHash("sha256");
  const reader = body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      hash.update(Buffer.from(value));
    }
  }
  return hash.digest("hex");
}
