import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { apiPost } from "../../../lib/api-client";
import { ExitCode } from "../../../lib/errors";
import { error, isJsonMode, printJson, success } from "../../../lib/output";

interface FileUploadOptions {
  exchangeFileId?: string;
  subId?: string;
  password?: string;
  timezone?: string;
}

export async function handler({
  ledgerId,
  options,
  args,
  cmd
}: {
  ledgerId: string;
  options: FileUploadOptions;
  args: { file: string };
  cmd: Command;
}): Promise<void> {
  const filePath = path.resolve(args.file);
  if (!fs.existsSync(filePath)) {
    error(`File not found: ${filePath}`);
    process.exitCode = ExitCode.BAD_PARAMS;
    return;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = fileBuffer.byteLength;

  const uploadFile: Record<string, unknown> = {
    exchangeFileId: options.exchangeFileId,
    name: fileName,
    size: fileSize,
    subId: options.subId || null
  };
  if (options.password) uploadFile.password = options.password;

  // Step 1: Pre-upload — get S3 presigned URL
  const preUploadBody: Record<string, unknown> = {
    ledgerId,
    files: [uploadFile],
    timezone: options.timezone || null
  };

  const preUpload = await apiPost<{
    results: ({ url: string; fields: Record<string, string> } | null)[];
  }>("/exchange-file/pre-upload", preUploadBody);

  const presigned = preUpload.results?.[0];
  if (!presigned) {
    error("Failed to get presigned upload URL.");
    process.exitCode = ExitCode.GENERAL;
    return;
  }

  // Step 2: Upload to S3 via multipart form
  const formData = new FormData();
  for (const [key, value] of Object.entries(presigned.fields)) {
    formData.append(key, value);
  }
  formData.append("file", new Blob([fileBuffer]), fileName);

  const s3Res = await fetch(presigned.url, { method: "POST", body: formData });
  if (!s3Res.ok) {
    const text = await s3Res.text();
    error(`S3 upload failed (${s3Res.status}): ${text}`);
    process.exitCode = ExitCode.NETWORK;
    return;
  }

  // Step 3: Post-upload — notify backend
  const postUploadBody: Record<string, unknown> = {
    ledgerId,
    files: [
      {
        ...uploadFile,
        bucket: presigned.fields.bucket || presigned.fields.Bucket,
        key: presigned.fields.key || presigned.fields.Key
      }
    ],
    timezone: options.timezone || null
  };

  const result = await apiPost<Record<string, unknown>>(
    "/exchange-file/post-upload",
    postUploadBody
  );

  if (isJsonMode(cmd)) {
    printJson(result);
    return;
  }

  success(`File "${fileName}" uploaded successfully.`);
}
