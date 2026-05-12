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
    query GetSplitTestConfig {
      shop {
        metafield(namespace: "shipping_threshold_split_test", key: "config") {
          value
        }
      }
    }
  `);

  const data = await response.json();

  const value = data.data.shop.metafield?.value;

  return {
    splitTestConfig: value ? JSON.parse(value) : null,
  };
};

export default function Index() {
  const { splitTestConfig } = useLoaderData<typeof loader>();
  const deliveryFetcher = useFetcher();
  const splitTestFetcher = useFetcher();
  const isSplitTestActive =
    splitTestFetcher.data?.config?.enabled ??
    splitTestConfig?.enabled ??
    false;

  return (

    <s-page heading="Shipping Threshold Split Test">

    <s-banner tone={isSplitTestActive ? "success" : "critical"}>
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
          <s-text>A/B Test Status:</s-text>
          <s-badge tone={isSplitTestActive ? "success" : "critical"}>
            {isSplitTestActive ? "Active" : "Inactive"}
          </s-badge>
        </div>

        <splitTestFetcher.Form method="post" action="/app/activate-split-test">
          <input type="hidden" name="enabled" value={isSplitTestActive ? "false" : "true"} />
          <s-button
            type="submit"
            variant={isSplitTestActive ? "secondary" : "primary"}
          >
            {isSplitTestActive ? "Disable A/B Test" : "Activate A/B Test"}
          </s-button>
        </splitTestFetcher.Form>
      </div>
    </s-banner>

      <s-section heading="Welcome to the MicroPerfumes Shipping Threshold Custom App.">
        <s-paragraph>
          This app creates a custom Shopify function that allows merchants to test and compare two different free shipping thresholds directly on the checkout page. It is designed to support A/B testing strategies and can be seamlessly integrated with experimentation platforms such as Shoplift, Convert, and similar optimization tools. The goal is to help merchants evaluate customer behavior and optimize conversion rates, average order value, and shipping incentive performance.
        </s-paragraph>
      </s-section>
      <s-section heading="Get Started with the A/B Test">
        <s-paragraph>
          To start the Shoplift A/B test, you need to activate a Shopify Delivery Customization. Click the button below.
        </s-paragraph>

        <s-stack direction="inline" gap="base">
        <deliveryFetcher.Form
          method="post"
          action="/app/activate-delivery-customization"
        >
          <s-button type="submit">Activate delivery customization</s-button>
        </deliveryFetcher.Form>
        </s-stack>

        <div style={{ marginTop: "16px" }}>
          {deliveryFetcher.data?.message && (
            <s-banner
              tone={fetcher.data.created ? "success" : "info"}
              heading={fetcher.data.created ? "Success" : "Already activated"}
            >
              <s-paragraph>{fetcher.data.message}</s-paragraph>
            </s-banner>
          )}

          {deliveryFetcher.data?.errors?.length > 0 && (
            <s-banner tone="critical" heading="Error">
              {fetcher.data.errors.map((error, index) => (
                <s-paragraph key={index}>{error.message}</s-paragraph>
              ))}
            </s-banner>
          )}
        </div>

      </s-section>

    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};