import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  return (
    <s-page heading="Shipping Threshold Split Test">

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
        <fetcher.Form
          method="post"
          action="/app/activate-delivery-customization"
        >
          <s-button type="submit">Activate delivery customization</s-button>
        </fetcher.Form>
        </s-stack>

        <div style={{ marginTop: "16px" }}>
          {fetcher.data?.message && (
            <s-banner
              tone={fetcher.data.created ? "success" : "info"}
              heading={fetcher.data.created ? "Success" : "Already activated"}
            >
              <s-paragraph>{fetcher.data.message}</s-paragraph>
            </s-banner>
          )}

          {fetcher.data?.errors?.length > 0 && (
            <s-banner tone="critical" heading="Error">
              {fetcher.data.errors.map((error, index) => (
                <s-paragraph key={index}>{error.message}</s-paragraph>
              ))}
            </s-banner>
          )}
        </div>
      </s-section>

      <s-section slot="aside" heading="App template specs">
        <s-paragraph>
          <s-text>Framework: </s-text>
          <s-link href="https://reactrouter.com/" target="_blank">
            React Router
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Interface: </s-text>
          <s-link
            href="https://shopify.dev/docs/api/app-home/using-polaris-components"
            target="_blank"
          >
            Polaris web components
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>API: </s-text>
          <s-link
            href="https://shopify.dev/docs/api/admin-graphql"
            target="_blank"
          >
            GraphQL
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Custom data: </s-text>
          <s-link
            href="https://shopify.dev/docs/apps/build/custom-data"
            target="_blank"
          >
            Metafields &amp; metaobjects
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Database: </s-text>
          <s-link href="https://www.prisma.io/" target="_blank">
            Prisma
          </s-link>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};