"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormItemContext = React.createContext<{ id: string }>({ id: "" });

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext.name) {
    throw new Error(
      "useFormField requires FormFieldContext with a valid field name. Make sure useFormField is used within <FormField>.",
    );
  }

  if (!itemContext.id) {
    throw new Error(
      "useFormField requires FormItemContext with a valid item id. Make sure useFormField is used within <FormItem>.",
    );
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormControl({ ...props }: React.ComponentProps<"div">) {
  const { formItemId, formDescriptionId, formMessageId, error } =
    useFormField();

  const describedBy = !error
    ? formDescriptionId
    : `${formDescriptionId} ${formMessageId}`;

  const isFocusableElement = (element: React.ReactElement) => {
    if (typeof element.type === "string") {
      if (["input", "textarea", "select", "button"].includes(element.type)) {
        return true;
      }

      if ((element.props as { href?: unknown }).href) {
        return true;
      }
    }

    const elementProps = element.props as {
      tabIndex?: number;
      contentEditable?: boolean | "true" | "false";
    };

    if (
      typeof elementProps.tabIndex === "number" &&
      elementProps.tabIndex >= 0
    ) {
      return true;
    }

    if (
      elementProps.contentEditable === true ||
      elementProps.contentEditable === "true"
    ) {
      return true;
    }

    return false;
  };

  const addA11yAttributes = (
    children: React.ReactNode,
    hasPatched: { value: boolean },
  ): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child) || hasPatched.value) {
        return child;
      }

      if (isFocusableElement(child)) {
        hasPatched.value = true;
        return React.cloneElement(child, {
          "aria-describedby": describedBy,
          "aria-invalid": Boolean(error),
        });
      }

      if (child.props?.children) {
        const updatedChildren = addA11yAttributes(
          child.props.children as React.ReactNode,
          hasPatched,
        );

        if (updatedChildren !== child.props.children) {
          return React.cloneElement(child, undefined, updatedChildren);
        }
      }

      return child;
    });
  };

  const hasPatchedControl = { value: false };
  const controlChildren = addA11yAttributes(props.children, hasPatchedControl);

  return (
    <div id={formItemId} {...props}>
      {controlChildren}
    </div>
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn("text-sm font-medium text-red-600", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  useFormField,
};
