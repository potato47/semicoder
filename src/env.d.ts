declare module "*.mdx" {
  import type { ComponentType, ComponentProps } from "react";
  const MDXContent: ComponentType<{ components?: { a?: ComponentType<ComponentProps<"a">> } }>;
  export default MDXContent;
}
