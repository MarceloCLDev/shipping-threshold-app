import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Split test metafield
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

  // Delivery customization status
  const deliveryCustomizationResponse = await admin.graphql(`
    #graphql
    query GetDeliveryCustomizations {
      deliveryCustomizations(first: 1) {
        nodes {
          id
          title
          enabled
        }
      }
    }
  `);

  const deliveryCustomizationData =
    await deliveryCustomizationResponse.json();

  const deliveryCustomization =
    deliveryCustomizationData.data.deliveryCustomizations.nodes[0] || null;

  return {
    splitTestConfig: value ? JSON.parse(value) : null,
    deliveryCustomization,
  };
};

export default function Index() {
  const { splitTestConfig, deliveryCustomization } = useLoaderData<typeof loader>();
  const deliveryFetcher = useFetcher();
  const splitTestFetcher = useFetcher();
  const isSplitTestActive =
    splitTestFetcher.data?.config?.enabled ??
    splitTestConfig?.enabled ??
    false;

  const isDeliveryCustomizationActive = !!deliveryCustomization;

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

      {isSplitTestActive && splitTestConfig && (
        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <s-box
            padding="base"
            border="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack gap="base">
              <s-text fontWeight="bold">Current A/B Test</s-text>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <s-text>{splitTestConfig.optionA}</s-text>
                <s-badge tone="info">{splitTestConfig.optionAPrice}</s-badge>

                <s-text tone="subdued">vs</s-text>

                <s-text>{splitTestConfig.optionB}</s-text>
                <s-badge tone="info">{splitTestConfig.optionBPrice}</s-badge>
              </div>
            </s-stack>
          </s-box>
        </div>
      )}

      <s-section heading="MicroPerfumes Shipping Threshold Custom App.">
        <s-paragraph>
          Discover the perfect shipping incentive. This app uses a custom Shopify Function to let you A/B test two different free shipping thresholds directly at checkout. By seamlessly integrating with optimization platforms like Shoplift and Convert, you can track real customer behavior to maximize your conversion rates and average order value.
        </s-paragraph>
      </s-section>
      <s-section heading="Enable App Functionality">
        <s-paragraph>
          This app requires a Shopify Delivery Customization to modify shipping options during checkout.
        </s-paragraph>

        <s-stack direction="inline" gap="base">

        {isDeliveryCustomizationActive ? (
            <s-banner tone="success">
              <s-text>
                Delivery customization is active and ready to use.
              </s-text>
            </s-banner>
        ) : (
          <deliveryFetcher.Form
            method="post"
            action="/app/activate-delivery-customization"
          >
            <s-button type="submit">
              Activate delivery customization
            </s-button>
          </deliveryFetcher.Form>
        )}

        <div style={{ marginTop: "16px" }}>
          {deliveryFetcher.data?.message && (
            <s-banner
              tone={deliveryFetcher.data.created ? "success" : "info"}
              heading={deliveryFetcher.data.created ? "Success" : "Already activated"}
            >
              <s-paragraph>{deliveryFetcher.data.message}</s-paragraph>
            </s-banner>
          )}

          {deliveryFetcher.data?.errors?.length > 0 && (
            <s-banner tone="critical" heading="Error">
              {deliveryFetcher.data.errors.map((error, index) => (
                <s-paragraph key={index}>{error.message}</s-paragraph>
              ))}
            </s-banner>
          )}
        </div>
        
        </s-stack>
      </s-section>

    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};