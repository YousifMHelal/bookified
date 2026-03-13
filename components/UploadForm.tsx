"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, LoaderCircle, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";

const MAX_PDF_SIZE = 50 * 1024 * 1024;
const VOICE_OPTIONS = {
  male: [
    {
      id: "dave",
      name: "Dave",
      description: "Young male, British-Essex, casual & conversational",
    },
    {
      id: "daniel",
      name: "Daniel",
      description: "Middle-aged male, British, authoritative but warm",
    },
    { id: "chris", name: "Chris", description: "Male, casual & easy-going" },
  ],
  female: [
    {
      id: "rachel",
      name: "Rachel",
      description: "Young female, American, calm & clear",
    },
    {
      id: "sarah",
      name: "Sarah",
      description: "Young female, American, soft & approachable",
    },
  ],
} as const;

const formSchema = z.object({
  pdfFile: z
    .custom<File>((value) => value instanceof File, "Please upload a PDF file")
    .refine((file) => file.size <= MAX_PDF_SIZE, "PDF must be 50MB or smaller")
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed",
    ),
  coverImage: z
    .custom<File | undefined>(
      (value) => value === undefined || value instanceof File,
    )
    .refine(
      (file) => !file || file.type.startsWith("image/"),
      "Cover image must be a valid image file",
    )
    .optional(),
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().min(1, "Author name is required"),
  voice: z.enum(["dave", "daniel", "chris", "rachel", "sarah"], {
    error: "Please choose a voice",
  }),
});

type UploadFormValues = z.infer<typeof formSchema>;

function UploadForm() {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: "rachel",
      coverImage: undefined,
    },
  });

  const onSubmit = async (values: UploadFormValues) => {
    void values;
    setIsSuccess(false);
    // Placeholder submission flow until backend upload endpoint is connected.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSuccess(true);
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <section className="new-book-wrapper">
      {isSubmitting ? (
        <div
          className="loading-wrapper"
          role="status"
          aria-live="polite"
          aria-busy>
          <div className="loading-shadow-wrapper bg-white border border-(--border-subtle) shadow-soft-lg">
            <div className="loading-shadow">
              <LoaderCircle className="size-10 text-(--accent-warm) loading-animation" />
              <h2 className="loading-title">Preparing Your Book</h2>
              <p className="text-center text-(--text-secondary)">
                We are validating files and setting up synthesis.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate>
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <label id="pdf-file-label" className="form-label">
                  Book PDF File
                </label>
                <FormControl>
                  <div
                    className={cn(
                      "upload-dropzone border-2 border-dashed border-[#d9cbb6]",
                      field.value && "upload-dropzone-uploaded",
                    )}
                    role="button"
                    tabIndex={0}
                    aria-labelledby="pdf-file-label"
                    onClick={() => pdfInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        pdfInputRef.current?.click();
                      }
                    }}>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        field.onChange(file);
                      }}
                    />

                    {field.value ? (
                      <>
                        <p className="upload-dropzone-text max-w-[85%] truncate">
                          {field.value.name}
                        </p>
                        <button
                          type="button"
                          className="upload-dropzone-remove mt-2"
                          onClick={(event) => {
                            event.stopPropagation();
                            field.onChange(undefined);
                            if (pdfInputRef.current) {
                              pdfInputRef.current.value = "";
                            }
                          }}
                          aria-label="Remove PDF file">
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">
                          Click to upload PDF
                        </p>
                        <p className="upload-dropzone-hint">
                          PDF file (max 50MB)
                        </p>
                      </>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <label id="cover-image-label" className="form-label">
                  Cover Image (Optional)
                </label>
                <FormControl>
                  <div
                    className={cn(
                      "upload-dropzone border-2 border-dashed border-[#d9cbb6]",
                      field.value && "upload-dropzone-uploaded",
                    )}
                    role="button"
                    tabIndex={0}
                    aria-labelledby="cover-image-label"
                    onClick={() => coverInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        coverInputRef.current?.click();
                      }
                    }}>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        field.onChange(file);
                      }}
                    />

                    {field.value ? (
                      <>
                        <p className="upload-dropzone-text max-w-[85%] truncate">
                          {field.value.name}
                        </p>
                        <button
                          type="button"
                          className="upload-dropzone-remove mt-2"
                          onClick={(event) => {
                            event.stopPropagation();
                            field.onChange(undefined);
                            if (coverInputRef.current) {
                              coverInputRef.current.value = "";
                            }
                          }}
                          aria-label="Remove cover image">
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">
                          Click to upload cover image
                        </p>
                        <p className="upload-dropzone-hint">
                          Leave empty to auto-generate from PDF
                        </p>
                      </>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <label className="form-label" htmlFor="title-input">
                  Title
                </label>
                <FormControl>
                  <input
                    id="title-input"
                    className="form-input"
                    placeholder="ex: Rich Dad Poor Dad"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <label className="form-label" htmlFor="author-input">
                  Author Name
                </label>
                <FormControl>
                  <input
                    id="author-input"
                    className="form-input"
                    placeholder="ex: Robert Kiyosaki"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <fieldset className="space-y-4">
                    <legend id="voice-choice-legend" className="form-label">
                      Choose Assistant Voice
                    </legend>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#5e5751]">
                        Male Voices
                      </p>
                      <div
                        className="voice-selector-options flex-col sm:flex-row"
                        role="radiogroup"
                        aria-labelledby="voice-choice-legend">
                        {VOICE_OPTIONS.male.map((voice) => {
                          const selected = field.value === voice.id;

                          return (
                            <label
                              key={voice.id}
                              className={cn(
                                "voice-selector-option items-start justify-start",
                                selected
                                  ? "voice-selector-option-selected"
                                  : "voice-selector-option-default",
                              )}>
                              <input
                                type="radio"
                                name={field.name}
                                value={voice.id}
                                checked={selected}
                                onChange={() => field.onChange(voice.id)}
                                onBlur={field.onBlur}
                                className="mt-0.5"
                              />
                              <div>
                                <p className="font-semibold text-(--text-primary)">
                                  {voice.name}
                                </p>
                                <p className="text-sm text-(--text-secondary)">
                                  {voice.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#5e5751]">
                        Female Voices
                      </p>
                      <div
                        className="voice-selector-options flex-col sm:flex-row"
                        role="radiogroup"
                        aria-labelledby="voice-choice-legend">
                        {VOICE_OPTIONS.female.map((voice) => {
                          const selected = field.value === voice.id;

                          return (
                            <label
                              key={voice.id}
                              className={cn(
                                "voice-selector-option items-start justify-start",
                                selected
                                  ? "voice-selector-option-selected"
                                  : "voice-selector-option-default",
                              )}>
                              <input
                                type="radio"
                                name={field.name}
                                value={voice.id}
                                checked={selected}
                                onChange={() => field.onChange(voice.id)}
                                onBlur={field.onBlur}
                                className="mt-0.5"
                              />
                              <div>
                                <p className="font-semibold text-(--text-primary)">
                                  {voice.name}
                                </p>
                                <p className="text-sm text-(--text-secondary)">
                                  {voice.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </fieldset>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button type="submit" className="form-btn" disabled={isSubmitting}>
            Begin Synthesis
          </button>

          {isSuccess ? (
            <p
              className="text-sm font-medium text-green-700"
              role="status"
              aria-live="polite">
              Your upload request was submitted successfully.
            </p>
          ) : null}
        </form>
      </Form>
    </section>
  );
}

export default UploadForm;
