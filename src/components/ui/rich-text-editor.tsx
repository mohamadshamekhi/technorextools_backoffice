"use client";

import { useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  ImageIcon,
  Undo2,
  Redo2,
  Heading2,
  Heading3,
  Loader2,
} from "lucide-react";
import { uploadImageAction } from "@/lib/media-actions";
import type { FieldErrors } from "@/lib/forms";
import { Field } from "@/components/ui/form-controls";

/** نمای تصویر داخل ادیتور با دستگیره‌ی تغییر اندازه (کشیدن گوشه‌ی پایین). */
function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [width, setWidth] = useState<string | null>(node.attrs.width ?? null);

  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = imgRef.current?.getBoundingClientRect().width ?? 0;

    function clamp(next: number) {
      const maxWidth = imgRef.current?.parentElement?.getBoundingClientRect().width ?? next;
      return Math.max(80, Math.min(Math.round(next), Math.round(maxWidth)));
    }

    function onMove(ev: PointerEvent) {
      // دستگیره روی گوشه‌ی پایانیِ تصویر است؛ در RTL جهت کشیدن معکوس می‌شود.
      const dir = document.dir === "rtl" ? -1 : 1;
      const next = clamp(startWidth + dir * (ev.clientX - startX));
      setWidth(`${next}px`);
    }
    function onUp(ev: PointerEvent) {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      const dir = document.dir === "rtl" ? -1 : 1;
      const next = clamp(startWidth + dir * (ev.clientX - startX));
      updateAttributes({ width: `${next}px` });
    }
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  return (
    <NodeViewWrapper as="span" className="relative inline-block leading-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt ?? ""}
        style={{ width: width ?? undefined }}
        className={`max-w-full rounded-md ${selected ? "ring-2 ring-primary" : ""}`}
      />
      <span
        onPointerDown={handleResizeStart}
        role="presentation"
        className="absolute -bottom-1 -inset-e-1 size-3.5 cursor-nwse-resize rounded-full border-2 border-primary bg-surface shadow-sm"
      />
    </NodeViewWrapper>
  );
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => el.style.width || el.getAttribute("width"),
        renderHTML: (attrs: { width?: string | null }) =>
          attrs.width ? { style: `width: ${attrs.width}` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

/**
 * ویرایشگر متن غنی (WYSIWYG) روی TipTap؛ خروجی رشته‌ی HTML است — همان قالبی
 * که فیلدهای `description`/`body` در بک‌اند انتظار دارند (`<p>...</p>`).
 * توضیح: `useEditor` هر بار با یک `content` اولیه ساخته می‌شود؛ برای همگام‌سازی
 * با تغییرات بیرونیِ `value` (مثلاً ریست فرم) نیازی نیست چون فرم‌های این پروژه
 * state را یک‌بار از prop اولیه می‌سازند (همان الگوی `useState(x?.field ?? "")`).
 */
function Toolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  function pickImage() {
    fileInputRef.current?.click();
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // اجازه‌ی انتخاب دوباره‌ی همان فایل
    if (!file) return;
    setIsUploading(true);
    const form = new FormData();
    form.set("file", file);
    form.set("purpose", "ATTACHMENT");
    form.set("folder", "content");
    const res = await uploadImageAction(form);
    setIsUploading(false);
    if (res.ok) {
      editor.chain().focus().setImage({ src: res.url }).run();
    } else {
      window.alert(res.message);
    }
  }

  const buttons: {
    label: string;
    icon: typeof Bold;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
  }[] = [
    {
      label: "درشت",
      icon: Bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "کج",
      icon: Italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "خط‌خورده",
      icon: Strikethrough,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      label: "تیتر ۲",
      icon: Heading2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "تیتر ۳",
      icon: Heading3,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "لیست نقطه‌ای",
      icon: List,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "لیست شماره‌دار",
      icon: ListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "نقل‌قول",
      icon: Quote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "افزودن لینک",
      icon: Link2,
      onClick: () => {
        const url = window.prompt("آدرس لینک را وارد کنید:", editor.getAttributes("link").href ?? "");
        if (url === null) return;
        if (url === "") {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      },
      active: editor.isActive("link"),
    },
    {
      label: "حذف لینک",
      icon: Link2Off,
      onClick: () => editor.chain().focus().unsetLink().run(),
      disabled: !editor.isActive("link"),
    },
    {
      label: "واگرد",
      icon: Undo2,
      onClick: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      label: "ازنو",
      icon: Redo2,
      onClick: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-surface-muted px-2 py-1.5">
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageFile} />
      {buttons.map(({ label, icon: Icon, onClick, active, disabled }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={`rounded-md p-1.5 transition-colors disabled:opacity-40 ${
            active ? "bg-primary-surface text-primary" : "text-muted hover:bg-border/60 hover:text-foreground"
          }`}
        >
          <Icon className="size-4" />
        </button>
      ))}
      <button
        type="button"
        onClick={pickImage}
        disabled={isUploading}
        aria-label="افزودن تصویر"
        className="rounded-md p-1.5 text-muted transition-colors hover:bg-border/60 hover:text-foreground disabled:opacity-40"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
      </button>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      ResizableImage.configure({ inline: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "prose-fa min-h-40 max-w-none px-3 py-2 text-sm outline-none [&_p]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-6 [&_ol]:ps-6 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-e-2 [&_blockquote]:border-border [&_blockquote]:pe-3 [&_blockquote]:text-muted [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return <div className="h-48 animate-pulse rounded-lg border bg-surface-muted" />;
  }

  return (
    <div className="overflow-hidden rounded-lg border focus-within:border-primary">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/** ترکیب Field + RichTextEditor با اتصال خودکار به خطای فیلدی — برای متن‌های HTML مثل توضیحات/متن مقاله */
export function RichTextField({
  label,
  name,
  hint,
  value,
  onChange,
  errors,
  onErrorClear,
}: {
  label: string;
  name: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  errors?: FieldErrors;
  onErrorClear?: (name: string) => void;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={errors?.[name]}>
      <RichTextEditor
        value={value}
        onChange={(html) => {
          onChange(html);
          onErrorClear?.(name);
        }}
      />
    </Field>
  );
}
