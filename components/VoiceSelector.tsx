"use client";

import React from "react";
import { voiceCategories, voiceOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { VoiceSelectorProps } from "@/types";

type VoiceId = keyof typeof voiceOptions;

interface VoiceCategoryProps {
  title: string;
  voiceIds: readonly string[];
  value?: string;
  disabled?: boolean;
}

const VoiceCategory = ({
  title,
  voiceIds,
  value,
  disabled,
}: VoiceCategoryProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-[#777]">{title}</h4>
      <div className="voice-selector-options">
        {voiceIds.map((voiceId) => {
          const voice = voiceOptions[voiceId as VoiceId];
          const isSelected = value === voiceId;
          return (
            <Label
              key={voiceId}
              className={cn(
                "voice-selector-option",
                isSelected
                  ? "voice-selector-option-selected"
                  : "voice-selector-option-default",
                disabled && "voice-selector-option-disabled",
              )}>
              <RadioGroupItem
                value={voiceId}
                id={voiceId}
                className="sr-only"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      isSelected ? "border-[#663820]" : "border-gray-300",
                    )}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#663820]" />
                    )}
                  </div>
                  <span className="font-bold text-[#212a3b]">{voice.name}</span>
                </div>
                <p className="text-xs text-[#777] leading-relaxed">
                  {voice.description}
                </p>
              </div>
            </Label>
          );
        })}
      </div>
    </div>
  );
};

const VoiceSelector = ({
  value,
  onChange,
  disabled,
  className,
}: VoiceSelectorProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-8">
        <VoiceCategory
          title="Male Voices"
          voiceIds={voiceCategories.male}
          value={value}
          disabled={disabled}
        />

        <VoiceCategory
          title="Female Voices"
          voiceIds={voiceCategories.female}
          value={value}
          disabled={disabled}
        />
      </RadioGroup>
    </div>
  );
};

export default VoiceSelector;
