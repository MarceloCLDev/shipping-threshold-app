import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    #graphql
    query GetBannerTestConfig {
      shop {
        bannerTestConfig: metafield(namespace: "$app", key: "banner_config") {
          value
        }
      }
    }
  `);

  const data = await response.json();

  return {
    bannerTestConfig: data.data.shop.bannerTestConfig?.value
      ? JSON.parse(data.data.shop.bannerTestConfig.value)
      : null,
  };
};

export default function BannerTest() {
  const { bannerTestConfig } = useLoaderData<typeof loader>();
  const bannerFetcher = useFetcher();

  const isBannerTestActive =
    bannerFetcher.data?.config?.enabled ??
    bannerTestConfig?.enabled ??
    false;

  return (
    <s-page heading="Checkout Banner A/B Test">
      <s-banner tone={isBannerTestActive ? "success" : "critical"}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <s-text>Banner Test Status:</s-text>

            <s-badge tone={isBannerTestActive ? "success" : "critical"}>
              {isBannerTestActive ? "Active" : "Inactive"}
            </s-badge>
          </div>

          <bannerFetcher.Form method="post" action="/app/activate-banner-test">
            <input type="hidden" name="enabled" value={isBannerTestActive ? "false" : "true"} />
            <s-button
              type="submit"
              variant={isBannerTestActive ? "secondary" : "primary"}
            >
              {isBannerTestActive ? "Disable A/B Test" : "Activate A/B Test"}
            </s-button>
          </bannerFetcher.Form>

        </div>
      </s-banner>

      <s-section heading="MicroPerfumes Checkout Disclaimer Banner">
        <s-paragraph>
          Display a customizable disclaimer or promotional message directly in the Shopify checkout. Edit the text, enable or disable the banner at any time, and support clickable links.
        </s-paragraph>
        <s-paragraph>
          <s-text type="strong">Setup:</s-text> After installing the app, open the Checkout Editor and add the MicroPerfumes Checkout Disclaimer Banner app block to the desired checkout location. The banner will only appear after the block has been added and the changes are published.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};