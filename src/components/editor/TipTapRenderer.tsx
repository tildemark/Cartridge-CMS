/**
 * Server-side TipTap JSON → HTML renderer.
 * Used on public pages to render stored TipTap content without the full editor.
 */

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, any> }[];
  attrs?: Record<string, any>;
}

function renderNode(node: TipTapNode): string {
  if (node.type === "text") {
    let text = escapeHtml(node.text ?? "");
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case "bold":
            text = `<strong>${text}</strong>`;
            break;
          case "italic":
            text = `<em>${text}</em>`;
            break;
          case "underline":
            text = `<u>${text}</u>`;
            break;
          case "strike":
            text = `<s>${text}</s>`;
            break;
          case "code":
            text = `<code>${text}</code>`;
            break;
          case "link":
            text = `<a href="${escapeHtml(mark.attrs?.href ?? "#")}" class="text-indigo-600 underline" target="${mark.attrs?.target ?? "_blank"}" rel="noopener noreferrer">${text}</a>`;
            break;
        }
      }
    }
    return text;
  }

  const inner = node.content?.map(renderNode).join("") ?? "";
  const align = node.attrs?.textAlign ? ` style="text-align:${node.attrs.textAlign}"` : "";

  switch (node.type) {
    case "doc":
      return inner;
    case "paragraph":
      return `<p${align} class="mb-4 leading-relaxed">${inner || "&nbsp;"}</p>`;
    case "heading": {
      const level = node.attrs?.level ?? 2;
      const cls = level === 1 ? "text-3xl font-bold mt-6 mb-3" : level === 2 ? "text-2xl font-bold mt-5 mb-2" : "text-xl font-semibold mt-4 mb-2";
      return `<h${level}${align} class="${cls} text-slate-900">${inner}</h${level}>`;
    }
    case "bulletList":
      return `<ul class="list-disc ml-5 mb-4 space-y-1">${inner}</ul>`;
    case "orderedList":
      return `<ol class="list-decimal ml-5 mb-4 space-y-1">${inner}</ol>`;
    case "listItem":
      return `<li class="leading-relaxed">${inner}</li>`;
    case "blockquote":
      return `<blockquote class="border-l-4 border-indigo-300 pl-4 italic text-slate-600 mb-4">${inner}</blockquote>`;
    case "codeBlock": {
      const lang = node.attrs?.language ?? "";
      return `<pre class="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto mb-4 text-sm"><code class="language-${lang}">${inner}</code></pre>`;
    }
    case "horizontalRule":
      return `<hr class="border-slate-200 my-6" />`;
    case "hardBreak":
      return `<br />`;
    case "image": {
      const src = escapeHtml(node.attrs?.src ?? "");
      const alt = escapeHtml(node.attrs?.alt ?? "");
      return `<img src="${src}" alt="${alt}" class="rounded-lg max-w-full my-4" />`;
    }
    default:
      return inner;
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface TipTapRendererProps {
  content?: string | null;
}

export default function TipTapRenderer({ content }: TipTapRendererProps) {
  if (!content) return null;

  let html = "";
  try {
    const doc = JSON.parse(content) as TipTapNode;
    html = renderNode(doc);
  } catch {
    html = `<p>${escapeHtml(content)}</p>`;
  }

  return (
    <div
      className="tiptap-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
