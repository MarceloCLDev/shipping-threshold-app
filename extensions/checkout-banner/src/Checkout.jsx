import "@shopify/ui-extensions/preact";
import { render } from "preact";

export default async () => {
  render(<Extension />, document.body);
};

function renderRichText(text) {
  const parts = [];
  const linkRegex =
    /<a\s+href=["']([^"']+)["'](?:\s+target=["'][^"']+["'])?\s*>(.*?)<\/a>/gi;

  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, href, label] = match;

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <s-link key={`link-${match.index}`} href={href} target="_blank">
        {label}
      </s-link>
    );

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function Extension() {
  const variant = shopify.attributes.current.find(
    (attribute) => attribute.key === "checkout_banner_test_variant"
  )?.value;

  const appMetafields =
    shopify.appMetafields.current || shopify.appMetafields.value || [];

  const bannerConfigMetafield = appMetafields.find(
    (appMetafield) =>
      appMetafield.metafield?.namespace === "$app" &&
      appMetafield.metafield?.key === "banner_config"
  );

  let config = null;

  try {
    config = bannerConfigMetafield?.metafield?.value
      ? JSON.parse(bannerConfigMetafield.metafield.value)
      : null;
  } catch {
    return null;
  }

  if (!config?.enabled || variant !== "A") {
    return null;
  }

  const bannerText =
    shopify.settings.current.banner_text ||
    config.bannerText ||
    "";

  return <s-stack paddingBlockStart="large" paddingBlockEnd="large"><s-paragraph>{renderRichText(bannerText)}</s-paragraph></s-stack>;
}