import { model, models, Schema } from "mongoose";
import { IPendingUpload } from "@/types";

const PendingUploadSchema = new Schema<IPendingUpload>(
  {
    clerkId: { type: String, required: true, index: true },
    blobKey: { type: String, required: true, index: true, trim: true },
  },
  { timestamps: true },
);

PendingUploadSchema.index({ clerkId: 1, blobKey: 1 }, { unique: true });

const PendingUpload =
  models.PendingUpload || model<IPendingUpload>("PendingUpload", PendingUploadSchema);

export default PendingUpload;
